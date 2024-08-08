import {
  BadRequestException,
  Logger,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
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
import { TablesService } from './tables.service';
import { Namespace } from 'socket.io';
import { SocketWithAuth } from './types';
import { WsCatchAllFilter } from 'src/exceptions/ws-catch-all-filter';
import { GatewayAdminGuard } from './guards/gateway-admin.guard';

@UsePipes(new ValidationPipe())
@UseFilters(new WsCatchAllFilter())
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

  async handleConnection(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    const roomName = client.tableID;
    await client.join(roomName);
    const connectedClients = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
    this.logger.debug(`userID: ${client.userID} joined room: ${roomName}`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.logger.debug(
      `Number of connected clients in room: ${roomName}: ${connectedClients}`,
    );

    const updatedTable = await this.tablesService.addParticipant({
      tableID: client.tableID,
      userID: client.userID,
      name: client.name,
    });

    this.io.to(roomName).emit('table_updated', updatedTable);
  }

  async handleDisconnect(client: SocketWithAuth) {
    const sockets = this.io.sockets;
    const { tableID, userID } = client;
    const updatedTable = await this.tablesService.removeParticipant({
      tableID,
      userID,
    });
    const roomName = tableID;
    const clientCount = this.io.adapter.rooms?.get(roomName)?.size ?? 0;
    this.logger.debug(`userID: ${userID} quit room: ${roomName}`);
    this.logger.debug(`Number of connected sockets: ${sockets.size}`);
    this.logger.debug(
      `Number of connected clients in room: ${roomName}: ${clientCount}`,
    );
    if (updatedTable) {
      this.io.to(roomName).emit('table_updated', updatedTable);
    }
  }

  @SubscribeMessage('test')
  async test() {
    throw new BadRequestException(['fdkf']);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('remove_participant')
  async removeParticipant(
    @MessageBody('id') id: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    this.logger.debug(
      `Attempting to remove participant ${id} from poll ${client.tableID}`,
    );
    const updatedTable = await this.tablesService.removeParticipant({
      tableID: client.tableID,
      userID: id,
    });
    if (updatedTable) {
      this.io.to(client.tableID).emit('table_updated', updatedTable);
    }
  }
}
