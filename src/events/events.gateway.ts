import {
    ConnectedSocket,
    MessageBody,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
  } from '@nestjs/websockets';
  import { Server, Socket as RawSocket } from 'socket.io';
import { CreatePlayerService } from 'src/player/createPlayer.service';
import { CreateRoomService } from 'src/room/createRoom/createRoom.service';
import { JoinRoomController } from 'src/room/joinRoom/joinRoom.controller';
import { JoinRoomService } from 'src/room/joinRoom/joinRoom.service';
  
  export type ClientToServerEvents = {
    createRoom: (callback: (roomCode: string) => void) => void;
    joinRoom: (callback: (roomCode: string) => void) => void;
    createPlayer: (idPlayer: string, pseudo: string) => void;
    getCurrentRoomCode: (callback: (roomCode: string) => void) => void;
    ping: (payload: string) => void;
    pingWithResponse: (
      payload: string,
      callback: (data: string) => void,
    ) => void;
  };
  
  // Recupere le premier parametre dans la definition des fonction
  // ClientToServer (correspond aux donnees envoyees par le client)
  type PayloadForEvent<T extends keyof ClientToServerEvents> = Parameters<
    ClientToServerEvents[T]
  >[0];
  
//   type ResponseForEvent<T extends keyof ClientToServerEvents> = Parameters<
//     ClientToServerEvents[T]
//   >[1] extends (response: infer U) => void
//     ? U
//     : void;
  
  export type ServerToClientEvents = {
    pong: (data: string) => void,
    createRoom: (data: string) => void,
    createPlayer: (data: string) => void,
    playersUpdated: (data: []) => void,
    // ex: updateBoard pour tout le monde quand un joueur fait une action
  };
  
  export type SocketData = {
    currentRoom: string;
    pseudo: string;
  };
  
  export type Socket = RawSocket<
    ClientToServerEvents,
    ServerToClientEvents,
    {},
    SocketData
  >;
  
  @WebSocketGateway(3011, { cors: { origin: '*' } })
  export class EventsGateway {
    constructor(
        private readonly createPlayerService: CreatePlayerService, 
        private readonly createRoomService: CreateRoomService, 
        private readonly joinRoomService: JoinRoomService,
        ) {}
  
    @WebSocketServer()
    server!: Server<
      ClientToServerEvents,
      ServerToClientEvents,
      {},
      SocketData
    >;
  
    @SubscribeMessage('ping')
    ping(
      @MessageBody() payload: PayloadForEvent<'ping'>,
      @ConnectedSocket() client: Socket,
    ) {
      // quand le client emet Ping, cette fonction est appelée
      console.log('ping', payload);

    //   this.createPlayerService.getCreatePlayer(payload);
      client.join('room/${code}');
      client.data.currentRoom = 'room/${code}';

      client.emit('pong', 'forMe');
      this.server.emit('pong', 'forAll');
      this.server.to('maRoom').emit('pong', 'forMyRoom');
      client.broadcast.to('maRoom').emit('pong', 'forOthersInMyRoom');
    }

    
    @SubscribeMessage('pingWithResponse')
    pingWithResponse(
      @MessageBody() payload: PayloadForEvent<'pingWithResponse'>,
      @ConnectedSocket() client: Socket,
    ): string {
      // quand le client emet Ping, cette fonction est appelée
      console.log('pingWithResponse', payload)
      return 'pong';
    }

    @SubscribeMessage('createRoom')
    async createRoom(
        @MessageBody() pseudo: PayloadForEvent<'createPlayer'>,
      @ConnectedSocket() client: Socket,
    ): Promise<string> {

        const idPlayer = client.id;
      const { code } = await this.createRoomService.getCreateRoom(idPlayer);
      await this.createPlayerService.getCreatePlayer(idPlayer, pseudo);

      const roomKey = `${code}`;
      client.join(roomKey);
      client.data.currentRoom = roomKey;
      client.data.pseudo = pseudo;
      console.log(client.data);

      return code;
    }

    @SubscribeMessage('joinRoom')
    async joinRoom(
      @MessageBody() roomCode: string,
      @ConnectedSocket() client: Socket,
    ): Promise<boolean> {
      const { code } = await this.joinRoomService.getJoinRoom(client.id, roomCode);

      const roomKey = `room/${code}`;
      client.join(roomKey);
      client.data.currentRoom = roomKey;

      this.server.to(roomKey).emit('playersUpdated', []);

      return true;
    }

    @SubscribeMessage('getCurrentRoomCode')
    async getCurrentRoomCode(
      @ConnectedSocket() client: Socket,
    ): Promise<string> {
      return client.data.currentRoom;
    }
}