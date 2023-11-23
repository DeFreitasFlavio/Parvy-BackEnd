import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Room } from '../../models/room.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';


@Injectable()
export class CreateRoomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getCreateRoom(): Promise<{}> {
    const client = this.cacheManager.store.getClient();

    const roomCode = await this.generateRoomCode();
    const room: Room = {
      code: roomCode,
      state: 'en attente',
    };

    await client.hset(
      room.code, 
      'code', room.code, 
      'state', room.state
    );

    const response = {
      response: 'ok',
      room
    }

    return response;
  }

  // Génération aléatoire du code de la partie (code à 6 chiffres)
  private async generateRoomCode(): Promise<string> {
    const min = 0;
    const max = 9;

    let i = 0;

    while(i < 1000) {
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
    return (await client.exists(generatedCode)) === 0
  }
}
