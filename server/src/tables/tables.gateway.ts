import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { TablesService } from './tables.service';
import { Namespace } from 'socket.io';
import { SocketWithAuth } from './types';

@WebSocketGateway({
  namespace: 'tables',
})
export class TablesGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(TablesGateway.name);
  constructor(private readonly tablesService: TablesService) {}

  @WebSocketServer() io: Namespace;

  afterInit(): void {
    this.logger.log(`Websocket gateway initialized`);
  }

  handleConnection(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    this.logger.debug(
      `Socket connected with userID: ${client.userID}, pollID: ${client.tableID}, and name: "${client.name}"`,
    );
    this.logger.log(`WS Client with id ${client.id} connected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }

  handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    this.logger.debug(
      `Socket connected with userID: ${client.userID}, pollID: ${client.tableID}, and name: "${client.name}"`,
    );
    this.logger.log(`WS Client with id ${client.id} disconnected`);
    this.logger.debug(`Number of connected clients: ${sockets.size}`);
  }
}
