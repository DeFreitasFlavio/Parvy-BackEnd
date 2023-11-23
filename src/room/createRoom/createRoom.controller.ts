import { Controller, Get } from '@nestjs/common';
import { CreateRoomService } from './createRoom.service';
// import { Redis } from 'redis';

@Controller()
export class CreateRoomController {
  constructor(private readonly CreateRoomService: CreateRoomService) {}

  @Get('/CreateRoom')
  getCreateRoom(): Promise<string> {
    return this.CreateRoomService.getCreateRoom();
  }
}