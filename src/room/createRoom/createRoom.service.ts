import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Room } from '../room.model';

@Injectable()
export class CreateRoomService {

  getCreateRoom(): string {

    const roomCode = this.generateRoomCode();
    const room = new Room({
      code: roomCode
    });

    return 'Code de la room : ' + room.code;
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
