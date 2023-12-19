import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CardService } from './card.service';
import { Card } from 'src/models/card.model';

@Controller('card')
export class CardController {
  constructor(private readonly CardService: CardService) {}

  @Post('create')
  postCreateCard(@Query('code') code: string, @Query('card') card: Card) {
    if (code.length !== 6 || !card) {
      throw new Error('Parameters incorrects');
    } else {
      return this.CardService.postReturnCard(code, card);
    }
  }
}