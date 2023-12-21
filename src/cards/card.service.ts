import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';

@Injectable()
export class CardService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async postCurrentCard(code: string, idCard: string) {
    const client = this.cacheManager.store.getClient();
    const nbEtages = await client.hget(code, 'etages');
    if (!nbEtages) {
      throw new Error('No floors');
    }
    const nbEtagesNumber = parseInt(nbEtages, 10);

    for (let i = 0; i < nbEtagesNumber; i++) {
      const floor = await client.lrange(
        `${code}/players/game/pyramid/${i}`,
        0,
        -1,
      );
      console.log(floor);
    }
  }
}
