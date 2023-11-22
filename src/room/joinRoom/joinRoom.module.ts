import { Module } from '@nestjs/common';
import { JoinRoomController } from './joinRoom.controller';
import { JoinRoomService } from './joinRoom.service';

@Module({
  imports: [],
  controllers: [JoinRoomController],
  providers: [JoinRoomService],
})
export class JoinRoomModule {}
