import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { JoinRoomService } from './joinRoom.service';

@Controller('room')
export class JoinRoomController {
  constructor(private readonly joinRoomService: JoinRoomService) {}

  @Get('join')
  async getCreateRoom(@Query('code') code?: string, @Query('idPlayer') idPlayer?: string): Promise<{}> {
    if (code?.length !== 6 || idPlayer?.length !== 8) {
      throw new Error("Incorrects settings !");
    } else {
      return this.joinRoomService.getJoinRoom(code, idPlayer);
    }
  }
}
