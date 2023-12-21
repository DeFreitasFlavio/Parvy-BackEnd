import { Controller, Get, Post, Query } from '@nestjs/common';
import { CardService } from './card.service';

@Controller('card')
export class CardController {
  constructor(private readonly CardService: CardService) {}

  @Post('return')
  postCurrentCard(
    @Query('code') code: string,
    @Query('numEtage') numEtage: number,
  ) {
    if (code.length !== 6 || !numEtage) {
      throw new Error('Parameters incorrects');
    } else {
      return this.CardService.postCurrentCard(code, numEtage);
    }
  }

  @Get('show')
  getCard(
    @Query('code') code: string,
    @Query('idPlayer') idPlayer: string,
    @Query('idCard') idCard: string,
  ): Promise<{}> {
    if (code.length !== 6 || idPlayer.length !== 8 || !idCard) {
      throw new Error('Parameters incorrects');
    } else {
      return this.CardService.getCardInHandPlayer(code, idPlayer, idCard);
    }
  }
}
