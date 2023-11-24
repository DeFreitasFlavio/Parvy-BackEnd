import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Room } from '../../models/room.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';


@Injectable()
export class CreateRoomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getCreateRoom(idPlayer: string): Promise<{}> {
    const client = this.cacheManager.store.getClient();

    // Si l'id du player passé en parametre n'existe pas dans le cache
    if (await client.exists(idPlayer) === 0) {
      throw new Error('Id player incorrect');
    }

    const roomCode = await this.generateRoomCode();
    const room: Room = {
      code: roomCode,
      state: 'en attente',
      playersId: [idPlayer]
    };

    // Insertion de la room créée dans le cache
    await client.hset(
      room.code, {
      'code': room.code, 
      'state': room.state
    });

    // Insertion du joueur dans le cache qui a créé la room dans une liste de joueurs liée à la room
    await client.sadd(room.code+'/players', idPlayer, idPlayer);

    // Insertion du code room dans le cache du player qui l'a créée
    await client.hset(idPlayer, 'currentRoomCode', room.code);

    // const roomCache = await client.hgetall(room.code);
    // const roomPlayersCache = await client.lrange(room.code + '/players', 0, -1);

    const response = {
      response: 'ok',
      room,
    }

    return response;
  }

  // Génération aléatoire du code de la partie (code à 6 chiffres)
  private async generateRoomCode(): Promise<string> {
    const min = 0;
    const max = 9;

    let i = 0;

    while (i < 1000) {
      const roomCode = [
        randomInt(min, max),
        randomInt(min, max),
        randomInt(min, max),
        randomInt(min, max),
        randomInt(min, max),
        randomInt(min, max),
      ].join('');

      if (await this.isRoomCodeFree(roomCode)) {
        return roomCode;
      }

      i++;
    }

    throw new Error('Unable to generate a room code');
  }

  //Vérifier que le code de room n'existe pas
  private async isRoomCodeFree(generatedCode: string): Promise<boolean> {
    const client = this.cacheManager.store.getClient();
    return (await client.exists(generatedCode)) === 0;
  }
}
