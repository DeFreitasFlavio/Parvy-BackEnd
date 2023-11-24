import { Module } from '@nestjs/common';
import { CreatePlayerController } from './createPlayer.controller';
import { CreatePlayerService } from './createPlayer.service';

@Module({
  imports: [],
  controllers: [CreatePlayerController],
  providers: [CreatePlayerService],
})
export class CreatePlayerModule {}
