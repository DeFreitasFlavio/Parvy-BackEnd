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

    const roomCode = this.generateRoomCode(client);
    const room = new Room({
      code: roomCode,
      state: 'en attente',
    });

    const redisRoom = await client.hset(
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
  generateRoomCode(client): string {
    const min = 0;
    const max = 9;

    const roomCode = [
      randomInt(min, max),
      randomInt(min, max),
      randomInt(min, max),
      randomInt(min, max),
      randomInt(min, max),
      randomInt(min, max),
    ];

    this.verifyRoomCode(client, roomCode);
    
    return roomCode.join('');
  }

  //Vérifier que le code de room n'existe pas
  verifyRoomCode(client, generatedCode): void {
    if (client.hget(generatedCode)) {
      this.generateRoomCode(client);
    }
  }
}
