import { Controller, Get, Query } from '@nestjs/common';
import { GameService } from './game.service';

@Controller('game')
export class GameController {
  constructor(private readonly GameService: GameService) {}

  @Get('start')
  getStartGame(@Query('code') code: string, @Query('etages') etages: number) {
    if (code.length !== 6 || etages > 7) {
      throw new Error('Parameters incorrects');
    } else {
      return this.GameService.startGame(code, etages);
    }
  }
}