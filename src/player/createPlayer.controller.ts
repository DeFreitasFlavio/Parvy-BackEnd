import { Controller, Get } from '@nestjs/common';
import { CreatePlayerService } from './createPlayer.service';

@Controller()
export class CreatePlayerController {
  constructor(private readonly CreatePlayerService: CreatePlayerService) {}

  @Get('/Createplayer')
  getCreatePlayer(): void {
    return this.CreatePlayerService.getCreatePlayer();
  }
}