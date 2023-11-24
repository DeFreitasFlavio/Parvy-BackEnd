import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheIORedis } from 'src/app.module';

@Injectable()
export class JoinRoomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getJoinRoom(code: string, idPlayer: string): Promise<{}> {

    const client = this.cacheManager.store.getClient();
    

    if (await client.exists(code) === 0 || await client.exists(idPlayer) === 0) {
      throw new Error('Incorrects settings !');
    }

    if (await client.hget(code, "state") === 'en cours') {
      return { response: 'Partie en cours.'};
    }

    await client.lpush(code+'/players', idPlayer);

    const roomDatas = await client.hgetall(code);
    const listPlayers = await client.lrange(code + '/players', 0, -1);

    const response = {
      response: 'ok',
      roomDatas,
      listPlayers
    };

    return response;
  }
}
