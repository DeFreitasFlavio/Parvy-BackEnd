import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheIORedis } from 'src/app.module';

@Injectable()
export class JoinRoomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getJoinRoom(code: string, idPlayer: string): Promise<boolean> {
    const client = this.cacheManager.store.getClient();
    
    let joined = true;

    if (await client.exists(`room/${code}`) === 0 || await client.exists(`player/${idPlayer}`) === 0) {
      joined = false;
      throw new Error('Incorrects settings !');
    }

    console.log(`joinGame ${idPlayer}`);

    if (await client.hget(`player/${idPlayer}`, "currentRoomCode")) {
      joined = false;
      throw new Error('Player already in other room');
    }

    if (await client.hget(`room/${code}`, "state") === 'en cours') {
      joined = false;
      throw new Error('Game already started');
    }

    try {
      await client.lpush(`roomPlayers/${code}`, idPlayer);
      await client.hset(`player/${idPlayer}`, 'currentRoomCode', code);
    } catch {
      joined = false;
    }
    
    return joined;
  }
}
