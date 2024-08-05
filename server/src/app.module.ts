import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TablesModule } from './tables/tables.module';

@Module({
  imports: [ConfigModule.forRoot(), TablesModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
