import { Controller, Get, Param, Query } from '@nestjs/common';
import { CreatePlayerService } from './createPlayer.service';

@Controller('/createPlayer')
export class CreatePlayerController {
  constructor(private readonly CreatePlayerService: CreatePlayerService) {}

  @Get()
  async getCreatePlayer(@Query('pseudo') pseudo: string): Promise<{}> {
    if (pseudo.length <= 16) {
      return this.CreatePlayerService.getCreatePlayer(pseudo);
    } else {
      throw new Error('Bad pseudo player parameter');
    }
  }
}