import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TablesController } from './tables.controller';
import { jwtModule, redisModule } from 'src/modules.config';
import { TablesService } from './tables.service';
import { TablesRepository } from './tables.repository';
import { TablesGateway } from './tables.gateway';

@Module({
  imports: [ConfigModule.forRoot(), redisModule, jwtModule],
  controllers: [TablesController],
  providers: [TablesService, TablesRepository, TablesGateway],
})
export class TablesModule {}
