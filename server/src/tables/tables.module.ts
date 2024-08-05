import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TablesController } from './tables.controller';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [TablesController],
  providers: [],
})
export class TablesModule {}
