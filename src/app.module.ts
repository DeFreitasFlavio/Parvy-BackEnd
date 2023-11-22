import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateRoomModule } from './room/createRoom/createRoom.module';
import { JoinRoomModule } from './room/joinRoom/joinRoom.module'

@Module({
  imports: [CreateRoomModule, JoinRoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
