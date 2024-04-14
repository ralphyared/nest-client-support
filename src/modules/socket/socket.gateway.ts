import {
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketService } from './socket.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class SocketGateway implements OnGatewayInit {
  @WebSocketServer() server: Server;

  constructor(private readonly socketService: SocketService) {}

  afterInit(server: Server) {
    this.socketService.initialize(server);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(client: Socket, userId: string) {
    client.join(userId);
  }
}
