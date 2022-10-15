import { Param } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';

import { Socket, Server } from 'socket.io';

interface AuthorClients {
  socket: Socket;
  author_id: number;
}
@WebSocketGateway(3100)
export class BasicGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() private _server: Server;
  private _clientes: Socket[] = [];
  private _authorClients: AuthorClients[] = [];

  get getClientes(): Socket[] {
    return [...this._clientes];
  }

  handleDisconnect(client: Socket) {
    console.log('cliente desconectado... --> ', client.id);
  }

  afterInit(server: Server) {
    console.log('server iniciado ---> ', this._server);
  }

  handleConnection(client: Socket, ...args: any[]) {
    console.log('cliente conectado... --> ', client.id);
    console.log('headers --> ', client.handshake.headers);
    console.log('params --> ', client.handshake.query);
  }

  @SubscribeMessage('clients_push')
  get_on_list(@ConnectedSocket() client: Socket): string {
    console.log(`cliente {${client.id}} uniendose... `);
    this._clientes.push(client);

    const { headers } = client.handshake;

    if (headers?.author_id && +headers?.author_id) {
      this._authorClients.push({
        socket: client,
        author_id: +headers.author_id,
      });
      console.log('autor valido, ingresado...');
    } else console.log('cliente no es autor, no entra !!!');
    return 'listoco';
  }

  @SubscribeMessage('clients_list')
  get_list(): string[] {
    console.log(
      `lista de clientes -> `,
      this.getClientes.map((i) => i.id),
    );
    return this.getClientes.map((i) => i.id);
  }

  @SubscribeMessage('clients_message')
  send_message() {
    console.log(
      `lista de clientes -> `,
      this.getClientes.map((i) => i.id),
    );
    this._clientes.forEach((x) =>
      x.emit('client_crap', { message: 'hello hard coded' }),
    );
    this._server.emit('clients_shiet', { message: 'hello from server' });
    return;
  }

  @SubscribeMessage('message')
  handleMessage(
    @ConnectedSocket() client: Socket,
    @Param('param1') nnn: any,
    @MessageBody() payload: any,
  ): string {
    console.log('cliente emitiendo message... --> ', client.id);
    console.log('param1... --> ', nnn);
    console.log('payload... --> ', payload);
    console.log('server -> ', this._server);
    return 'Hello world!';
  }
}
