import { Controller, Get, Param } from '@nestjs/common';
import { CreatePlayerService } from './createPlayer.service';
import { Player } from 'src/models/player.model';

@Controller('/createPlayer')
export class CreatePlayerController {
  constructor(private readonly CreatePlayerService: CreatePlayerService) {}

  @Get(':pseudo')
  async getCreatePlayer(@Param('pseudo') pseudo: string): Promise<{}> {
    return this.CreatePlayerService.getCreatePlayer(pseudo);
  }
}