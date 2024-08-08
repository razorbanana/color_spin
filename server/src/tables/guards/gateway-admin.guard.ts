import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { TablesService } from '../tables.service';
import { JwtService } from '@nestjs/jwt';
import { AuthPayload, SocketWithAuth } from '../types';
import { WsUnauthorizedException } from 'src/exceptions/ws-exceptions';

@Injectable()
export class GatewayAdminGuard implements CanActivate {
  private readonly logger = new Logger(GatewayAdminGuard.name);
  constructor(
    private readonly tablesService: TablesService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const socket: SocketWithAuth = context.switchToWs().getClient();
    const token =
      socket.handshake.auth.token || socket.handshake.headers['token'];
    if (!token) {
      this.logger.error('No token provided');
      throw new WsUnauthorizedException('No token provided');
    }
    try {
      const payload = this.jwtService.verify<AuthPayload & { sub: string }>(
        token,
      );
      this.logger.debug(`Validating admin using payload`, payload);
      const { sub, tableID } = payload;
      const table = await this.tablesService.getTable(tableID);
      if (sub !== table.adminID) {
        throw new WsUnauthorizedException('Admin privileges required');
      }
      return true;
    } catch (e) {
      throw new WsUnauthorizedException('Admin privileges required');
    }
  }
}
