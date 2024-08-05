import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateTableDto, JoinTableDto } from './dtos';

@Controller('tables')
export class TablesController {
  @Post()
  async create(@Body() createTableDto: CreateTableDto) {
    Logger.log('create table');
    return createTableDto;
  }

  @Post('join')
  async join(@Body() joinTableDto: JoinTableDto) {
    Logger.log('join table');
    return joinTableDto;
  }

  @Post('rejoin')
  async rejoin() {
    Logger.log('rejoin table');
  }
}
