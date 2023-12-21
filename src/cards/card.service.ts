import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';
import { number } from 'yargs';

@Injectable()
export class CardService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async postCurrentCard(code: string, numEtage: number) {
    const client = this.cacheManager.store.getClient();

    const maxEtages = await client.hget(`${code}`, 'etages');
    if (!maxEtages) {
      throw new Error('No max floor');
    }

    const maxEtagesNumber = parseInt(maxEtages, 10);
    const tabEtages = [];
    for (let i = maxEtagesNumber; i >= 1; i--) {
      tabEtages.push(i);
    }

    let etage = 0;
    for (let index = 0; index < maxEtagesNumber; index++) {
      if (tabEtages[index] == numEtage) {
        etage = index + 1;
      }
    }

    const cards = await client
      .lrange(`${code}/players/game/pyramid/floor/${etage}`, 0, -1)
      .then((stringifiedCards) =>
        stringifiedCards.map((card) => JSON.parse(card)),
      );

    for (const card of cards) {
      if (card.face === 0) {
        card.face = 1;
        await client.lpush(
          `${code}/players/game/pyramid/floor/${etage}`,
          cards,
        );
        return {
          currentCard: card,
          floor: cards,
        };
      }
    }
  }
}
