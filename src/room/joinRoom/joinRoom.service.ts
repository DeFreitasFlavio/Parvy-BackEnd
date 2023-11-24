import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CacheIORedis } from 'src/app.module';

@Injectable()
export class JoinRoomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getJoinRoom(code: string): Promise<string> {
    const client = this.cacheManager.store.getClient();

    if ((await client.exists(code)) === 0) {
      return 'Le code de la room est incorrect.';
    } else {
      const roomDatas = await client.hgetall(code);
      return (
        'Vous avez rejoins la room ' +
        roomDatas.code +
        '. Elle est ' +
        roomDatas.state
      );
    }
  }
}
