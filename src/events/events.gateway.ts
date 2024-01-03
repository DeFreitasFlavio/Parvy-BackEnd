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
import { JoinRoomService } from 'src/room/joinRoom/joinRoom.service';
import { GameService } from 'src/game/game.service';
import { CardService } from 'src/cards/card.service';
import { Card } from 'src/models/card.model';
  
  export type ClientToServerEvents = {
    createRoom: (
        pseudo: string,
        callback: (
            roomCode: string
            ) => void
        ) => void;
    joinRoom: (
        pseudo: string,
        roomCode: string,
        callback: () => void
    ) => void;
    leaveRoom: (
        callback: (
            leaved: boolean
        ) => void
    ) => void;
    startGamePyramid: (
        callback: (
            isStarted: boolean
        ) => void
    ) => void;
    getCurrentRoomCode: (
        callback: (
            roomCode: string
        ) => void
    ) => void;
    getPlayersInRoom: (
        callback: (
            playerList: string[]
        ) => void
    ) => void;
    getPseudo: (
        callback: (
            pseudo: string
        ) => void
    ) => void;
    getNextCard: (
      callback: (
        currentCard: object
      ) => void
    ) => void;
    showCard: (
      idCard: string,
      callback: (
        currentCard: object
      ) => void
    ) => void;
    getMyCards: (
      callback: (
        hand: object[]
      ) => void
    ) => void;
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
    playersUpdated: (data: string[]) => void,
    redirectInGame: (data: string) => void,
    getCurrentCard: (data: object) => void,
    // ex: updateBoard pour tout le monde quand un joueur fait une action
  };
  
  export type SocketData = {
    currentRoom: string;
    pseudo?: string;
    state?: string;
    maxFloors?: number;
    hand?: object[];
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
        private readonly gameService: GameService,
        private readonly cardService: CardService
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
      return 'pong';
    }

    @SubscribeMessage('createRoom')
    async createRoom(
      @MessageBody() pseudo: PayloadForEvent<'createRoom'>,
      @ConnectedSocket() client: Socket,
    ): Promise<string> {

      const idPlayer = client.id;
      await this.createPlayerService.getCreatePlayer(idPlayer, pseudo);
      const { code } = await this.createRoomService.getCreateRoom(idPlayer);

      const roomKey = `${code}`;
      client.join(roomKey);
      client.data.currentRoom = roomKey;
      client.data.pseudo = pseudo;

      return code;
    }

    @SubscribeMessage('joinRoom')
    async joinRoom(
      @MessageBody() pseudo: PayloadForEvent<'createRoom'>,
      @MessageBody() roomCode: PayloadForEvent<'createRoom'>, 
      @ConnectedSocket() client: Socket,
    ): Promise<boolean> {

      const idPlayer = client.id;
      await this.createPlayerService.getCreatePlayer(idPlayer, pseudo[0]);
      const isJoined = await this.joinRoomService.getJoinRoom(roomCode[1], idPlayer);

      if (isJoined) {
        const roomKey = `${roomCode[1]}`;
        client.join(roomKey);
        client.data.currentRoom = roomKey;
        client.data.pseudo = pseudo;
      }

      return isJoined;
    }

    @SubscribeMessage('leaveRoom')
    async leaveRoom(
        @ConnectedSocket() client: Socket,
    ): Promise<boolean> {

        const idPlayer = client.id;
        const roomCode = client.data.currentRoom;
        let isLeaved = true;

        try {
            await this.createPlayerService.postPlayerLeaveRoom(roomCode, idPlayer);
            client.data.currentRoom = "";
        } catch {
            isLeaved = false;
        }

        return isLeaved;
    }

    @SubscribeMessage('startGamePyramid')
    async startGamePyramid(
        @ConnectedSocket() client: Socket,
    ): Promise<boolean> {
        
        let isStarted = true;
        let etages = 7;
        const roomCode = client.data.currentRoom;
        await this.gameService.startGame(roomCode, { etages });

        client.data.state = 'en cours';
        client.data.maxFloors = etages;

        const url = '/pyramide/game';
        this.server.to(roomCode).emit('redirectInGame', url);
        
        return isStarted;
    }

    @SubscribeMessage('getCurrentRoomCode')
    async getCurrentRoomCode(
      @ConnectedSocket() client: Socket,
    ): Promise<string> {
      return client.data.currentRoom;
    }

    @SubscribeMessage('getPlayersInRoom')
    async getPlayersInRoom(
        @ConnectedSocket() client: Socket,
    ): Promise<string[]> {
        const currentRoomCode = client.data.currentRoom;
        const playersList = await this.createPlayerService.getPlayersInRoom(currentRoomCode);
        this.server.to(currentRoomCode).emit('playersUpdated', playersList);

        return playersList;
    }

    @SubscribeMessage('getPseudo')
    async getMyPseudo(
        @ConnectedSocket() client: Socket,
    ): Promise<string | undefined> {
        return client.data.pseudo;
    }

    // A vérifier
    @SubscribeMessage('getNextCard')
    async getNextCard(
      @ConnectedSocket() client: Socket,
    ): Promise<object | undefined> {
      const currentRoomCode = client.data.currentRoom;

      const currentCard = await this.cardService.postCurrentCard(currentRoomCode);
      this.server.to(currentRoomCode).emit('getCurrentCard', currentCard);
      
      return currentCard;
    }

    // A vérifier
    @SubscribeMessage('showCard')
    async showCard(
      @MessageBody() idCard: PayloadForEvent<'createRoom'>,
      @ConnectedSocket() client: Socket,
    ): Promise<object | undefined> {
      const idPlayer = client.id;
      const currentRoomCode = client.data.currentRoom;

      const card = await this.cardService.getCardInHandPlayer(currentRoomCode, idPlayer, idCard);
      this.server.to(currentRoomCode).emit('getCurrentCard', card);

      return card;
    }

    @SubscribeMessage('getMyCards')
    async getMyCards(
        @ConnectedSocket() client: Socket,
    ): Promise<object[]> {      
      const idPlayer = client.id;
      const currentRoomCode = client.data.currentRoom;
      
      const hand = await this.createPlayerService.getCardsInMyHand(currentRoomCode, idPlayer);
      
      client.data.hand = hand;

      return hand;
    }
}