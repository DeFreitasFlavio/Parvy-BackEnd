import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';
import IORedis, { Cluster } from 'ioredis';

export interface GameSettings {
  etages: number;
  nbCardsInHand?: number;
}

export interface Response {
  response: string;
  room?: {};
  game?: {};
  players?: {};
}

type GameParams = Required<GameSettings> & { code: string };

@Injectable()
export class GameService {
  private client: IORedis | Cluster;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {
    this.client = this.cacheManager.store.getClient();
  }

  async startGame(code: string, settings: GameSettings): Promise<Response> {
    const params: GameParams = {
      nbCardsInHand: 4,
      ...settings,
      code,
    };

    const values = [
      'A',
      '2',
      '3',
      '4',
      '5',
      '6',
      '7',
      '8',
      '9',
      '10',
      'J',
      'Q',
      'K',
    ];

    await this.client.hset(code, 'state', 'en cours');
    await this.client.hset(code, 'etages', params.etages);

    await this.createCards(code, values);

    const playerIds = await this.client.smembers(
      code + '/players',
    ); /* liste des id players */

    await this.dealHands(playerIds, params, values);

    await this.buildPyramid(playerIds, params);

    return this.formatResponse(playerIds, params);
  }

  async dealHands(
    playerIds: string[],
    { code, nbCardsInHand }: GameParams,
    values: string[],
  ) {
    //Pour chaque joueur dans la room retirer des cartes de la pioche et lui donner les cartes dans la main
    const nbOfCardToDraw = nbCardsInHand * playerIds.length;
    const cardsToDeal = await this.client.lpop(`${code}/deck`, nbOfCardToDraw);

    if (!cardsToDeal) throw new Error('no cards to deal');

    const cardsToPlayers = playerIds.map((playerId) => ({
      playerId,
      hand: cardsToDeal.splice(0, nbCardsInHand),
    }));

    const promises: Promise<unknown>[] = [];
    for (const { playerId, hand } of cardsToPlayers) {
      const toSort = hand.map((stringifiedCard) => stringifiedCard);
      const sortedHand = this.sortByValue(toSort, values);

      promises.push(
        this.client.lpush(`${code}/players/${playerId}/hand`, ...sortedHand),
      );
    }

    await Promise.all(promises);
  }

  async buildPyramid(
    playerIds: string[],
    { code, nbCardsInHand, etages }: GameParams,
  ) {
    let nbCardsInPyramid = 0;
    for (let i = 1; i <= etages; i++) {
      nbCardsInPyramid += i;
    }

    const deckKey = `${code}/deck`;

    const remainingCardLength = await this.client.llen(deckKey);
    const nbPlayerCards = playerIds.length * nbCardsInHand;

    if (remainingCardLength - nbPlayerCards + nbCardsInPyramid <= 0) {
      throw new Error('Number of floors to big');
    }

    const cardsToDeal = await this.client.lpop(
      `${code}/deck`,
      nbCardsInPyramid,
    );

    const promises: Promise<unknown>[] = [];
    //Création de la pyramide. Pour chaque étage, attribuer un nombre de carte
    for (let numEtage = etages; numEtage > 0; numEtage--) {
      const nbCardsByFloor = -1 * (numEtage - etages) + 1;

      if(!cardsToDeal) throw new Error('no cards to deal');
      const cardsInFloor = cardsToDeal.splice(0, nbCardsByFloor);

      promises.push(
        this.client.lpush(
          `${code}/players/game/pyramid/floor/${nbCardsByFloor}`,
          ...cardsInFloor,
        ),
      );
    }

    await Promise.all(promises);
  }

  private async createCards(code: string, values: string[]) {
    const cardKinds = [
      { color: 'red', signe: 'carreau' },
      { color: 'red', signe: 'coeur' },
      { color: 'black', signe: 'trefle' },
      { color: 'black', signe: 'pique' },
    ];

    let id = 1;

    const deck = [];

    for (let { color, signe } of cardKinds) {
      for (let value of values) {
        deck.push({
          id,
          value,
          signe,
          color,
          face: 0,
          image: `${signe}-${value}.png`,
        });

        id += 1;
      }
    }

    //Mélange des cartes dans la pioche
    for (let i = 0; i < deck.length - 1; i++) {
      const j =
        (i + Math.floor(Math.random() * (deck.length - i - 1))) % deck.length;
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    await this.client.lpush(
      `${code}/deck`,
      ...deck.map((card) => JSON.stringify(card)),
    );
  }

  private sortByValue(hand: string[], values: string[]) {
    const sortedHand = hand.sort((cardA, cardB) => {
      const valueA = JSON.parse(cardA).value;
      const valueB = JSON.parse(cardB).value;

      // Trouve la position des valeurs dans le tableau `values`
      const indexA = values.indexOf(valueA);
      const indexB = values.indexOf(valueB);

      // Retourne le résultat du tri
      return indexA + indexB;
    });

    return sortedHand;
  }

  private async formatResponse(
    playerIds: string[],
    { code, etages }: GameParams,
  ): Promise<Response> {
    //Récupération des informations de la room
    const roomPromise = this.client.hgetall(`${code}`);

    const gamePromises: Promise<unknown>[] = [];
    //Récupération de chaque étage de la pyramide
    for (let etage = etages; etage >= 1; etage--) {
      gamePromises.push(
        this.client
          .lrange(`${code}/players/game/pyramid/floor/${etage}`, 0, -1)
          .then((stringifiedCards) =>
            stringifiedCards.map((card) => JSON.parse(card)),
          ),
      );
    }

    const playerPromises: Promise<unknown>[] = [];
    //Récupération de la liste des joueurs et de leur main
    for (let playerId of playerIds) {
      playerPromises.push(
        this.client.hgetall(`${playerId}`).then(async (player) => ({
          ...player,
          hand: await this.client
            .lrange(`${code}/players/${playerId}/hand`, 0, -1)
            .then((stringifiedCards) =>
              stringifiedCards.map((card) => JSON.parse(card)),
            ),
        })),
      );
    }

    const [room, game, players] = await Promise.all([
      roomPromise,
      Promise.all(gamePromises),
      Promise.all(playerPromises),
    ]);

    return {
      response: 'ok',
      room,
      game,
      players,
    };
  }
}
