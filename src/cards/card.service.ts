import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';
import { Card } from 'src/models/card.model';

@Injectable()
export class CardService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async postCurrentCard(code: string, idCard: string): Promise<{}> {
    const client = this.cacheManager.store.getClient();

    let etage: number|unknown = 1;
    if (await client.hexists(`room/${code}`, 'currentFloor') === 0) {
      etage = await client.hset(`room/${code}`, 'currentFloor', 1);
    } else {
      etage = await client.hget(`room/${code}`, 'currentFloor');
    }

    const maxEtages = await client.hget(`room/${code}`, 'etages');
    if (!maxEtages) {
      throw new Error('No max floor');
    }

    let stringifiedCards = await client
      .lrange(`roomPyramidFloors/${code}/floor/${etage}`, 0, -1)
    
    let cards = stringifiedCards.map((card) => JSON.parse(card) as Card);

    for (let i = 0; i < cards.length; i++) {
      let card = cards[i];
      if (card.id === idCard) {

        if (i+1 > cards.length) {
          stringifiedCards = await client
            .lrange(`roomPyramidFloors/${code}/floor/${etage}`, 0, -1)
    
          cards = stringifiedCards.map((card) => JSON.parse(card) as Card);

          card = cards[0];
        } else {
          card = cards[i+1];
        }

        await client.lpush(
          `roomPyramidFloors/${code}/floor/${etage}`,
          ...stringifiedCards,
        );
        
        return {
          card,
        };
      }
    }

    return {};
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

    const response = {
      cardToShow
    };

    return response;
  }
}
