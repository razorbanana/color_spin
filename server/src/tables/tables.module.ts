import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TablesController } from './tables.controller';
import { redisModule } from 'src/modules.config';
import { TablesService } from './tables.service';
import { TablesRepository } from './tables.repository';

@Module({
  imports: [ConfigModule.forRoot(), redisModule],
  controllers: [TablesController],
  providers: [TablesService, TablesRepository],
})
export class TablesModule {}
