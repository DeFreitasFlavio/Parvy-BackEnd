import { Module } from '@nestjs/common';
import { EventsGateway } from './events.gateway';
import { CreatePlayerModule } from 'src/player/createPlayer.module';
import { CreateRoomModule } from 'src/room/createRoom/createRoom.module';
import { JoinRoomModule } from 'src/room/joinRoom/joinRoom.module';

@Module({
  providers: [EventsGateway],
  imports: [CreatePlayerModule, CreateRoomModule, JoinRoomModule]
})
export class EventsModule {}