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

  async postPlayerLeaveRoom(code: string, idPlayer: string): Promise<boolean> {
    const client = this.cacheManager.store.getClient();
    console.log('leave');
    let isLeaved = true;

    if (!(await client.exists(`room/${code}`)) || !(await client.exists(`player/${idPlayer}`))) {
      isLeaved = false;
      throw new Error('Invalid settings.');
    }

    try{
      await client.lrem(`roomPlayers/${code}`, 1, idPlayer);
      await client.del(`player/${idPlayer}`);
    } catch {
      isLeaved = false;
    }

    // S'il n'y a plus de players dans la room, elle se delete
    if (!(await client.exists(`roomPlayers/${code}`))) {
      try {
        await client.del(`room/${code}`);
        await client.del(`roomDeck/${code}`);
  
        /** toDo delete cards in hand player */
        const keys = await client.keys(`roomPlayers/${code}/players/*`);
        await client.del(keys);
      } catch {
        isLeaved = false;
      }
    }

    return isLeaved;
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
