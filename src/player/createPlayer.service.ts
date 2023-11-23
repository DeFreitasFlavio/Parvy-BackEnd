import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Player } from '../models/player.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';


@Injectable()
export class CreatePlayerService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  getCreatePlayer(): void {

  }
}