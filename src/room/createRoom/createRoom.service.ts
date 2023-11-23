import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Room } from '../../models/room.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';


@Injectable()
export class CreateRoomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getCreateRoom(): Promise<string> {
    const client = this.cacheManager.store.getClient();

    const roomCode = this.generateRoomCode();
    const room = new Room({
      code: roomCode,
      state: 'en attente',
    });

    const result = await client.sadd('room/'+room.code, room.code);
    const stateRoom = await client.sadd('room/'+room.code+'/state', room.state);

    return 'Code de la room : ' + room.code + ' est ' + room.state;
  }

  // Génération aléatoire du code de la partie (code à 6 chiffres)
  generateRoomCode(): string {
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
    
    return roomCode.join('');
  }
}
