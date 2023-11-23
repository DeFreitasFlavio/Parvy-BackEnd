import { Controller, Get, Inject, Param } from '@nestjs/common';
import { JoinRoomService } from './joinRoom.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { CacheIORedis } from 'src/app.module';

@Controller()
export class JoinRoomController {
  constructor(private readonly JoinRoomService: JoinRoomService){};

  @Get('/JoinRoom/:code')
  async getCreateRoom(@Param('code') code: string): Promise<string> {

    if (code.length !== 6) {
      return "Code incorrecte !";
    } else {
      return this.JoinRoomService.getJoinRoom(code);
    }
  }
}