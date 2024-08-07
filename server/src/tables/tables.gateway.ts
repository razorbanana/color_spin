import { Logger } from '@nestjs/common';
import { OnGatewayInit, WebSocketGateway } from '@nestjs/websockets';
import { TablesService } from './tables.service';

@WebSocketGateway({
  namespace: 'tables',
})
export class TablesGateway implements OnGatewayInit {
  private readonly logger = new Logger(TablesGateway.name);
  constructor(private readonly tablesService: TablesService) {}

  afterInit(): void {
    this.logger.log(`Websocket gateway initialized`);
  }
}
