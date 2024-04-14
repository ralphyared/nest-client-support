import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class SocketService {
  private server: Server;

  public initialize(server: Server) {
    this.server = server;
  }

  public emitEventToUser(userId: string, eventName: string, data: any) {
    this.server.to(userId).emit(eventName, data);
  }
}
