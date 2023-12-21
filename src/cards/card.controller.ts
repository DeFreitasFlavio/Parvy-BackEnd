import { Controller, Post, Query } from '@nestjs/common';
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
}
