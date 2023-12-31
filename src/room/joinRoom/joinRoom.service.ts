import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheIORedis } from 'src/app.module';

@Injectable()
export class JoinRoomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getJoinRoom(code: string, idPlayer: string): Promise<{}> {
    const client = this.cacheManager.store.getClient();

    if (
      (await client.exists(code)) === 0 ||
      (await client.exists(idPlayer)) === 0
    ) {
      throw new Error('Incorrects settings !');
    }

    if (await client.hget(idPlayer, 'currentRoomCode')) {
      throw new Error('Player already in other room');
    }

    if ((await client.hget(code, 'state')) === 'en cours') {
      return { response: 'Partie en cours.' };
    }

    await client.sadd(code + '/players', idPlayer);
    await client.hset(idPlayer, 'currentRoomCode', code);

    const room = await client.hgetall(code);
    const listPlayers = await client.smembers(code + '/players');

    const response = {
      response: 'ok',
      room,
      listPlayers,
    };

    return response;
  }

  async getInfoRoom(code: string): Promise<{}> {
    const client = this.cacheManager.store.getClient();

    if ((await client.exists(code)) === 0) {
      throw new Error('Incorrects settings !');
    } else {
      const room = await client.hgetall(code);
      const listPlayers = await client.smembers(code + '/players');

      const response = {
        response: 'ok',
        room,
        listPlayers,
      };

      return response;
    }
  }
}
