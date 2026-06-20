import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
@WebSocketGateway({
  namespace: '/ws',
  cors: { origin: '*' },
})
export class AppGateway implements OnModuleInit {
  constructor(private jwtService: JwtService) {}
  @WebSocketServer()
  server: Server;

  onModuleInit() {
    this.server.on('connection', (socket) => {
      console.log('Connection', socket);
      const token = socket.handshake.headers.cookie
        ?.split(' ')
        .filter((cok) => cok.startsWith('token'))
        ?.at(0)
        ?.split('=')[1];
      const user = this.jwtService.decode(token ?? '') as
        | {
            companyId: string;
            role: string;
          }
        | undefined;
      if (user?.role == 'manager') socket.join(`company:${user?.companyId}`);
      else if (user?.role == 'admin') socket.join('admin');
    });
    this.server.on('disconnection', (socket) => {
      console.log('disconnection', socket);
    });
  }
  @SubscribeMessage('sendMessage')
  send(@MessageBody() message) {
    this.server.emit('sendMessage', message);
  }
}
