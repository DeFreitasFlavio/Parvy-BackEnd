import { Inject, Injectable } from '@nestjs/common';
import { Player } from '../models/player.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';

@Injectable()
export class CreatePlayerService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getCreatePlayer(idPlayer: string, pseudo: string): Promise<{}> {
    const client = this.cacheManager.store.getClient();

    const player: Player = {
      id: idPlayer,
      pseudo: pseudo,
    };

    await client.hset(`player/${idPlayer}`, 'id', idPlayer, 'pseudo', pseudo);

    const response = {
      player
    };

    return response;
  }

  async postPlayerLeaveRoom(code: string, idPlayer: string) {
    const client = this.cacheManager.store.getClient();

    if (!(await client.exists(`room/${code}`)) || !(await client.exists(`player/${idPlayer}`))) {
      throw new Error('Invalid settings.');
    }

    await client.lrem(`roomPlayer/${code}`, -1, idPlayer);
    await client.del(`player/${idPlayer}`);

    // S'il n'y a plus de players dans la room, elle se delete
    if (!(await client.exists(code + '/players'))) {
      await client.del(`room/${code}`);
      await client.del(`roomDeck/${code}/deck`);
      await client.del(`roomPlayers${code}`);
      /** toDo */
      const keys = await client.keys(`roomPlayers/${code}/players/*`);
      await client.del(keys);
    }
  }

  async getPlayersInRoom(code: string): Promise<string[]> {
    const client = this.cacheManager.store.getClient();

    const listPlayers = await client.lrange(`roomPlayers/${code}`, 0, -1);

    const playerPseudoList: string[] = [];

    for (const idPlayer of listPlayers) {
      const pseudo: string | null = await client.hget(`player/${idPlayer}`, 'pseudo');
      if (pseudo !== null) {
        playerPseudoList.push(pseudo);
      }
    }

    return playerPseudoList
  }
}
