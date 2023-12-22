import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheIORedis } from 'src/app.module';
import { Room } from 'src/models/room.model';

@Injectable()
export class JoinRoomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getJoinRoom(code: string, idPlayer: string): Promise<Room> {
    const client = this.cacheManager.store.getClient();
    

    if (await client.exists(code) === 0 || await client.exists(idPlayer) === 0) {
      throw new Error('Incorrects settings !');
    }

    if (await client.hget(idPlayer, "currentRoomCode")) {
      throw new Error('Player already in other room');
    }

    if (await client.hget(code, "state") === 'en cours') {
      throw new Error('Game already started');
    }

    await client.sadd(code+'/players', idPlayer);
    await client.hset(idPlayer, 'currentRoomCode', code);

    const roomDatas = await client.hgetall(code);
    
    const room: Room = {
      code: roomDatas.code,
      state: roomDatas.state
    }

    const listPlayers = await client.smembers(code + '/players');

    return room;
  }
}
