import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheIORedis } from 'src/app.module';

@Injectable()
export class JoinRoomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getJoinRoom(code): Promise<string> {

    const client = this.cacheManager.store.getClient();

    const existRoom = await client.smembers('room/'+code);
    const existRoomState = await client.smembers('room/'+code+'/state');
    
    if (existRoom.length > 0) {
      return 'La room : ' + code + ' est ' + existRoomState;
    } else {
      return 'Le code de la room est incorrect.';
    }
  }
}
