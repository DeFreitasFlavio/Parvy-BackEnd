import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';

@Injectable()
export class CreateRoomService {

  getCreateRoom(): string {

    const roomCode = this.generateRoomCode();
    return 'Code de la room : ' + roomCode;
  }

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
