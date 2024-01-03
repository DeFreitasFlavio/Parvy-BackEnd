import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';
import { Card } from 'src/models/card.model';

@Injectable()
export class CardService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async postCurrentCard(code: string): Promise<{}> {
    const client = this.cacheManager.store.getClient();
  
    let etage: string|null = await client.hget(`room/${code}`, 'currentFloor');
    let intEtage: number = 1;
    const maxFloors: string|null = await client.hget(`room/${code}`, 'etages');

    if (etage && maxFloors) {
      intEtage = this.calculateFloorNumber(parseInt(maxFloors), parseInt(etage));
    }

    let currentCard: Card|null = await this.getCurrentCard(code);

    const maxEtages = await client.hget(`room/${code}`, 'etages');
    if (!maxEtages) {
      throw new Error('No max floor');
    }

    let stringifiedCards = await client
      .lrange(`roomPyramidFloors/${code}/floor/${intEtage}`, 0, -1)
    
    let cards = stringifiedCards.map((card) => JSON.parse(card) as Card);

    let card: Card = Object();
    for (let i = 0; i < cards.length; i++) {
      card = cards[i];
      if (currentCard) {
        // S'il y a une carte courante
        if (card.id === currentCard.id) {
          // Si l'id de la carte courante dans redis est le meme que la carte récupérée alors on va récupérer la carte suivante.
          if (i+1 === cards.length) {
            // Si on dépasse la taille de la ligne, on passe à la suivante et on récupère la première carte
            const newEtage = intEtage - 1
            stringifiedCards = await client
              .lrange(`roomPyramidFloors/${code}/floor/${newEtage}`, 0, -1);

            cards = stringifiedCards.map((card) => JSON.parse(card) as Card);

            // La première carte de l'étage suivant est récupéré mais celles d'apres ne sont pas récupérées et ça boucle sur la premiere

            card = cards[0];
            const redisCard = JSON.stringify(card);
            await client.hset(`room/${code}`, 'currentCard', redisCard);
            await client.hset(`room/${code}`, 'currentFloor', newEtage);

          } else {
            // On récupère la carte qui vient après la carte courante
            card = cards[i+1];
            const redisCard = JSON.stringify(card);
            await client.hset(`room/${code}`, 'currentCard', redisCard);
          }
        }

      } else {
        //Si aucune carte n'est dans les cartes courantes
        stringifiedCards = await client
        .lrange(`roomPyramidFloors/${code}/floor/${intEtage}`, 0, -1)

        cards = stringifiedCards.map((card) => JSON.parse(card) as Card);

        card = cards[0];

        const redisCard: string = JSON.stringify(card);

        await client.hset(`room/${code}`, 'currentCard', redisCard);
      }
    }

    const stringifiedFinalCard: string|null = await client.hget(`room/${code}`, 'currentCard');
    if (!stringifiedFinalCard) {
      throw new Error('No final card');
    }
    const finalCard: Card = JSON.parse(stringifiedFinalCard);
    return finalCard;
  }

  calculateFloorNumber(maxFloors: number, currentFloor: number): number {
    const floor = (currentFloor - (maxFloors + 1)) * (-1);
    return floor;
  }

  async getCurrentCard(code: string): Promise<Card|null> {
    const client = this.cacheManager.store.getClient();

    const stringifyCurrentCard: string|null = await client.hget(`room/${code}`, 'currentCard');

    if (stringifyCurrentCard) {
      let currentCard = JSON.parse(stringifyCurrentCard);

      return currentCard;
    }

    return null;
  }

  async getCardInHandPlayer(
    code: string,
    idPlayer: string,
    idCard: string,
  ): Promise<{}> {
    const client = this.cacheManager.store.getClient();

    const handPlayer = await client
      .lrange(`roomPlayersHand/${code}/players/${idPlayer}`, 0, -1)
      .then((stringifiedCards) =>
        stringifiedCards.map((card) => JSON.parse(card)),
      );

    const player = await client.hgetall(`player/${idPlayer}`);

    let cardToShow = {};
    for (let card of handPlayer) {
      if (card.id.toString() === idCard) {
        cardToShow = card;
      }
    }
    
    return cardToShow;
  }
}
