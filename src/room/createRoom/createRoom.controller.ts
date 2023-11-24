import { Controller, Get, Param } from '@nestjs/common';
import { CreateRoomService } from './createRoom.service';

@Controller('/CreateRoom')
export class CreateRoomController {
  constructor(private readonly CreateRoomService: CreateRoomService) {}

  @Get(':idPlayer')
  getCreateRoom(@Param('idPlayer') idPlayer: string): Promise<{}> {
    return this.CreateRoomService.getCreateRoom(idPlayer);
  }
}