import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateRoomModule } from './createRoom/createRoom.module';

@Module({
  imports: [CreateRoomModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
