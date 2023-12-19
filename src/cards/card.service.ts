import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';
import { Card } from 'src/models/card.model';


@Injectable()
export class CardService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

    async postReturnCard(code: string, card: Card) {
        
    }
}