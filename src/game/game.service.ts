import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';
import { Card, cardSchema } from 'src/models/card.model';
import { Player, playerSchema } from 'src/models/player.model';
import { Pyramid, pyramidSchema } from 'src/models/pyramid.model';
import IORedis from 'ioredis';

export interface GameSettings {
  etages: number;
  nbCardsInHand?: number;
}

type GameParams = Required<GameSettings> & { code: string };

@Injectable()
export class GameService {
  private client: IORedis.Redis | IORedis.Cluster;

  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {
    this.client = this.cacheManager.store.getClient();
  }

  async startGame(code: string, settings: GameSettings): Promise<void> {
    const params: GameParams = {
      nbCardsInHand: 4,
      ...settings,
      code,
    };

    await this.createCards(code);

    const playerIds = await this.client.smembers(
      code + '/players',
    ); /* liste des id players */

    await this.dealHands(playerIds, params);

    await this.buildPyramid(playerIds, params);
  }

  async dealHands(playerIds: string[], { code, nbCardsInHand }: GameParams) {
    // LIST $code/deck
    // LIST $code/players/$playerId/hand

    //Pour chaque joueur dans la room retirer des cartes de la pioche et lui donner les cartes dans la main
    const nbOfCardToDraw = nbCardsInHand * playerIds.length;
    const cardsToDeal = await this.client.lpop(`${code}/deck`, nbOfCardToDraw);

    const cardsToPlayers = playerIds.map((playerId) => ({
      playerId,
      hand: cardsToDeal.splice(nbCardsInHand),
    }));

    const promises: Promise<unknown>[] = [];
    for (const { playerId, hand } of cardsToPlayers) {
      const toSort = hand.map((stringifiedCard) => ({
        pos: JSON.parse(stringifiedCard).id,
        stringifiedCard,
      }));
      toSort.sort((a, b) => a.pos - b.pos);
      const sortedHand = toSort.map((card) => card.stringifiedCard);

      promises.push(
        this.client.lpush(`${code}/players/${playerId}/hand`, sortedHand),
      );
    }

    await Promise.all(promises);
  }

  async buildPyramid(
    playerIds: string[],
    { code, nbCardsInHand, etages }: GameParams,
  ) {
    let pyramide: Pyramid = {
      totalLevels: etages,
    };

    let nbCardsInPyramid = 0;
    for (let i = 1; i <= etages; i++) {
      nbCardsInPyramid += i;
    }

    const deckKey = `${code}/deck`;

    const remainingCardLength = await this.client.llen(deckKey);

    if (
      remainingCardLength -
        playerIds.length * nbCardsInHand +
        nbCardsInPyramid <=
      0
    ) {
      throw new Error('Number of floors to big');
    }

    // 1. lmpop nbCardsInPyramid in deck
    // 2. construire un tableau par etage avec les cartes
    // 3. persister chaque etage avec un promise all

    // 30. optimiser en utilisant les fontionalité de transaction et d'execution multiple à redis

    //Création de la pyramide. Pour chaque étage, attribuer un nombre de carte
    for (let numEtage = etages; numEtage > 0; numEtage--) {
      //Récupérer le nombre de carte pour les mettre dans la pyramide
      const cardsInFloor: Card[] = [];
      for (
        let nbCardsInFloor = numEtage;
        nbCardsInFloor > 0;
        nbCardsInFloor--
      ) {
        const currentCard = cards.pop();
        if (!currentCard) {
          throw new Error('No card left to deal pyramid');
        }
        cardsInFloor.push(currentCard);
        await this.client.del(code + '/card/' + currentCard.id);
      }
      const nameObjectCurrentFloor = `floor${numEtage}`;
      Object.assign(pyramide, {
        [nameObjectCurrentFloor]: {
          level: numEtage,
          cards: cardsInFloor,
        },
      });
    }

    let response = {
      response: 'ok',
      cards,
      players,
      pyramide,
    };

    return response;
  }

  private async createCards(code: string) {
    const cardKinds = [
      { color: 'red', signe: 'carreau' },
      { color: 'red', signe: 'coeur' },
      { color: 'black', signe: 'trefle' },
      { color: 'black', signe: 'pique' },
    ];
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
      deck, // or deck.map((card) => JSON.stringify(card))
    );
  }
}
