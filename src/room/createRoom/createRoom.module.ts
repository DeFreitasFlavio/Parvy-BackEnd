import { Module } from '@nestjs/common';
import { CreateRoomController } from './createRoom.controller';
import { CreateRoomService } from './createRoom.service';

@Module({
  imports: [],
  controllers: [CreateRoomController],
  providers: [CreateRoomService],
})
export class CreateRoomModule {}
