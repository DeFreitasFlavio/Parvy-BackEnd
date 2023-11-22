import { Controller, Get } from '@nestjs/common';
import { JoinRoomService } from './joinRoom.service';

@Controller()
export class JoinRoomController {
  constructor(private readonly JoinRoomService: JoinRoomService) {}

  @Get('/JoinRoom')
  getCreateRoom(): string {
    return this.JoinRoomService.getJoinRoom();
  }
}