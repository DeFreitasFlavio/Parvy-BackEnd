import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import { Room } from '../room.model';

@Injectable()
export class JoinRoomService {

  getJoinRoom(): string {
    return 'Code de la room join ';
  }
}
