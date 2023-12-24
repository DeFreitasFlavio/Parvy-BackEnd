import { Inject, Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Room, roomSchema } from '../../models/room.model';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';

@Injectable()
export class CreateRoomService {
  constructor(@Inject(CACHE_MANAGER) private cacheManager: CacheIORedis) {}

  async getCreateRoom(idPlayer: string): Promise<Room> {
    const client = this.cacheManager.store.getClient();

    const playerHost = await client.hgetall(`player/${idPlayer}`);

    const roomCode = await this.generateRoomCode();

    const room = roomSchema.parse({
      code: roomCode,
      state: 'en attente',
      playersId: [playerHost]
    });

    const promises: Promise<unknown>[] = [];

    promises.push(
      // Insertion de la room créée dans le cache
      client.hset(
        `room/${room.code}`, {
        'code': room.code, 
        'state': room.state
      })
    );

    promises.push(
      // Insertion du joueur dans le cache qui a créé la room dans une liste de joueurs liée à la room
      client.lpush(`roomPlayers/${room.code}`, idPlayer)
    )

    promises.push(
      // Insertion du code room dans le cache du player qui l'a créée
      client.hset(`player/${idPlayer}`, 'currentRoomCode', room.code)
    )

    await Promise.all(promises);

    return room;
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
    return (await client.exists(`room/${generatedCode}`)) === 0;
  }
}
