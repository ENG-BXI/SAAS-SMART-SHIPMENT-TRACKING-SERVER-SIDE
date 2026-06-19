import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: '*' },
})
export class AppGateway implements OnModuleInit {
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('====================================');
      console.log('Connection', socket);
      console.log('====================================');
    });
    this.server.on('disconnection', (socket) => {
      console.log('====================================');
      console.log('Connection', socket);
      console.log('====================================');
    });
  }
  @SubscribeMessage('sendMessage')
  send(@MessageBody() message) {
    this.server.emit('sendMessage', message);
  }
}
