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
import { SocketWithAuth, UpdateParticipantCreditsData } from './types';
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
    this.io.to(client.tableID).emit('participant_removed', id);
    const updatedTable = await this.tablesService.removeParticipant({
      tableID: client.tableID,
      userID: id,
    });
    if (updatedTable) {
      this.io.to(client.tableID).emit('table_updated', updatedTable);
    }
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('update_credits')
  async updateCredits(
    @MessageBody('credits') credits: number,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { tableID, userID } = client;
    this.logger.debug(
      `Attempting to update credits for userID ${userID} to amount ${credits}`,
    );
    const updateParticipantCreditsData: UpdateParticipantCreditsData = {
      tableID,
      userID,
      credits,
    };
    const updatedTable = await this.tablesService.updateParticipantCredits(
      updateParticipantCreditsData,
    );
    if (updatedTable) {
      this.io.to(tableID).emit('table_updated', updatedTable);
    }

    return true;
  }

  @SubscribeMessage('choose_color')
  async chooseColor(
    @MessageBody('color') color: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { tableID, userID } = client;
    const table = await this.tablesService.getTable(tableID);
    if (table.hasStarted) {
      throw new BadRequestException(
        'You can`t change your color after game has started',
      );
    }
    this.logger.debug(
      `Attempting to choose color ${color} for userID ${userID}`,
    );
    const updatedTable = await this.tablesService.chooseColor({
      tableID,
      userID,
      color,
    });
    this.io.to(tableID).emit('table_updated', updatedTable);
  }

  @SubscribeMessage('place_bet')
  async placeBet(
    @MessageBody('bet') bet: number,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { tableID, userID } = client;
    const table = await this.tablesService.getTable(tableID);
    if (table.hasStarted) {
      throw new BadRequestException(
        'You can`t change your bet after game has started',
      );
    }
    if (table.participants[userID].credits < bet) {
      throw new BadRequestException('Not enough credits');
    }
    this.logger.debug(`Attempting to place bet ${bet} for userID ${userID}`);
    const updatedTable = await this.tablesService.placeBet({
      tableID,
      userID,
      bet,
    });
    this.io.to(tableID).emit('table_updated', updatedTable);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('start_game')
  async startGame(@ConnectedSocket() client: SocketWithAuth) {
    const { tableID } = client;
    const table = await this.tablesService.getTable(tableID);
    const allColorsChosen = Object.values(table.participants).every(
      (participant) => participant.chosenColor !== null,
    );
    if (!allColorsChosen) {
      throw new BadRequestException('Not all users have chosen a color');
    }
    const updatedTable = await this.tablesService.startGame(tableID);
    this.io.to(tableID).emit('table_updated', updatedTable);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('end_game')
  async endGame(
    @MessageBody('color') color: string,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    const { tableID } = client;
    const table = await this.tablesService.getTable(tableID);
    if (!table.hasStarted) {
      throw new BadRequestException('Game has not started');
    }
    const updatedTable = await this.tablesService.endGame(tableID, color);
    this.io.to(tableID).emit('table_updated', updatedTable);
  }

  @UseGuards(GatewayAdminGuard)
  @SubscribeMessage('roulette_number')
  async gameNumber(
    @MessageBody('number') number: number,
    @ConnectedSocket() client: SocketWithAuth,
  ) {
    this.io.to(client.tableID).emit('game_number', number);
  }
}
