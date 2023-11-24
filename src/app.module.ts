import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CreateRoomModule } from './room/createRoom/createRoom.module';
import { JoinRoomModule } from './room/joinRoom/joinRoom.module';
import type { RedisOptions } from 'ioredis';
import * as redisStore from 'cache-manager-ioredis';
import { CacheModule } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager'
import { CreatePlayerModule } from './player/createPlayer.module';

export type CacheIORedis = Cache<ReturnType<typeof redisStore.create>>

@Module({
  imports: [
    CacheModule.register<RedisOptions>({
      isGlobal: true,
      store: redisStore,

      // Store-specific configuration:
      host: 'localhost',
      port: 6379,
    }),
    CreateRoomModule, 
    JoinRoomModule,
    CreatePlayerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
