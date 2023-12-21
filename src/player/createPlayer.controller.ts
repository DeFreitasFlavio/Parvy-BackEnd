import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CreatePlayerService } from './createPlayer.service';

@Controller('player')
export class CreatePlayerController {
  constructor(private readonly createPlayerService: CreatePlayerService) {}

  @Get('create')
  async getCreatePlayer(@Query('pseudo') pseudo: string): Promise<{}> {
    if (pseudo.length <= 16) {
      return this.createPlayerService.getCreatePlayer(pseudo);
    } else {
      throw new Error('Bad pseudo player parameter');
    }
  }

  @Post('leave')
  postPlayerLeaveRoom(
    @Query('code') code?: string,
    @Query('idPlayer') idPlayer?: string,
  ) {
    if (code?.length !== 6 || idPlayer?.length !== 8) {
      throw new Error('Parameters incorrects');
    } else {
      return this.createPlayerService.postPlayerLeaveRoom(code, idPlayer);
    }
  }
}
