import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Player } from '../models/player.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';

@Injectable()
export class CreatePlayerService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getCreatePlayer(idPlayer: string, pseudo: string): Promise<{}> {
    const client = this.cacheManager.store.getClient();

    const playerId = await this.generatePlayerid();
    const player: Player = {
      id: playerId,
      pseudo: pseudo,
    };

    await client.hset(playerId, 'id', playerId, 'pseudo', pseudo);

    const response = {
      response: 'ok',
      player,
    };

    return response;
  }

  // Génération aléatoire du code de la partie (code à 6 chiffres)
  private async generatePlayerid(): Promise<string> {
    const min = 0;
    const max = 9;

    let i = 0;

    while (i < 1000) {
      const playerId = [
        randomInt(min, max),
        randomInt(min, max),
        randomInt(min, max),
        randomInt(min, max),
        randomInt(min, max),
        randomInt(min, max),
        randomInt(min, max),
        randomInt(min, max),
      ].join('');

      if (await this.isPlayerIdFree(playerId)) {
        return playerId;
      }

      i++;
    }

    throw new Error('Unable to generate a player id');
  }

  //Vérifier que le code de room n'existe pas
  private async isPlayerIdFree(generatedCode: string): Promise<boolean> {
    const client = this.cacheManager.store.getClient();
    return (await client.exists(generatedCode)) === 0;
  }

  async postPlayerLeaveRoom(code: string, idPlayer: string) {
    const client = this.cacheManager.store.getClient();

    if (!(await client.exists(code)) || !(await client.exists(idPlayer))) {
      throw new Error('Invalid settings.');
    }

    await client.srem(code + '/players', idPlayer);
    await client.del(idPlayer);

    // S'il n'y a plus de players dans la room, elle se delete
    if (!(await client.exists(code + '/players'))) {
      await client.del(`${code}`);
      await client.del(`${code}/deck`);
      await client.del(`${code}/players`);
      const keys = await client.keys(`${code}/players/*`);
      await client.del(keys);
    }
  }
}
