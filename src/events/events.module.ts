import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { CreatePlayerModule } from 'src/player/createPlayer.module';
import { CreateRoomModule } from 'src/room/createRoom/createRoom.module';
import { JoinRoomModule } from 'src/room/joinRoom/joinRoom.module';
import { GameModule } from 'src/game/game.module';
import { CardModule } from 'src/cards/card.module';

@Module({
  providers: [EventsGateway],
  imports: [
    CreatePlayerModule, 
    CreateRoomModule, 
    JoinRoomModule, 
    GameModule, 
    CardModule
  ]
})
export class EventsModule {}