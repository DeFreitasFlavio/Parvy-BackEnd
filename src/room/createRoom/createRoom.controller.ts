import { Controller, Get } from '@nestjs/common';
import { CreateRoomService } from './createRoom.service';

@Controller()
export class CreateRoomController {
  constructor(private readonly CreateRoomService: CreateRoomService) {}

  @Get('/CreateRoom')
  getCreateRoom(): Promise<unknown> {
    return this.CreateRoomService.getCreateRoom();
  }
}
