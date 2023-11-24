import { Controller, Get, Param, Query } from '@nestjs/common';
import { CreateRoomService } from './createRoom.service';

@Controller('/CreateRoom')
export class CreateRoomController {
  constructor(private readonly CreateRoomService: CreateRoomService) {}

  @Get()
  getCreateRoom(@Query('idPlayer') idPlayer: string): Promise<{}> {

    if (idPlayer.length === 8) {
      return this.CreateRoomService.getCreateRoom(idPlayer);
    } else {
      throw new Error('Bad id player parameter');
    }
    
  }
}
