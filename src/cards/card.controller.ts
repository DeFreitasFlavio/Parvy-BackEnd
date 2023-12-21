import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CardService } from './card.service';

@Controller('card')
export class CardController {
  constructor(private readonly CardService: CardService) {}

  @Post('return')
  postCurrentCard(
    @Query('code') code: string,
    @Query('idCard') idCard: string,
  ) {
    if (code.length !== 6 || !idCard) {
      throw new Error('Parameters incorrects');
    } else {
      return this.CardService.postCurrentCard(code, idCard);
    }
  }
}
