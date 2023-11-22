import { Controller, Get, Param } from '@nestjs/common';
import { JoinRoomService } from './joinRoom.service';

@Controller()
export class JoinRoomController {
  constructor(private readonly JoinRoomService: JoinRoomService) {}

  @Get('/JoinRoom/:code')
  getCreateRoom(@Param('code') code: string): string {

    
    return code;
  }
}