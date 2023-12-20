import { Controller, Get, Post, Query } from '@nestjs/common';
import { CreatePlayerService } from './createPlayer.service';
import { Player } from 'src/models/player.model';

@Controller('player')
export class CreatePlayerController {
  constructor(private readonly CreatePlayerService: CreatePlayerService) {}

  @Get('create')
  async getCreatePlayer(
    @Query('pseudo') pseudo: string,
  ): Promise<{ response: string; player: Player }> {
    if (pseudo.length <= 16) {
      return this.CreatePlayerService.getCreatePlayer(pseudo);
    } else {
      throw new Error('Bad pseudo player parameter');
    }
  }

  @Post('leave')
  postPlayerLeaveRoom(
    @Query('code') code: string,
    @Query('idPlayer') idPlayer: string,
  ) {
    if (code.length !== 6 || idPlayer.length !== 8) {
      throw new Error('Parameters incorrects');
    } else {
      return this.CreatePlayerService.postPlayerLeaveRoom(code, idPlayer);
    }
  }
}
