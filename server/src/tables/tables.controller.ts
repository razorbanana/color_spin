import { Body, Controller, Logger, Post } from '@nestjs/common';
import { CreateTableDto, JoinTableDto } from './dtos';
import { TablesService } from './tables.service';

@Controller('tables')
export class TablesController {
  constructor(private tablesService: TablesService) {}

  @Post()
  async create(@Body() createTableDto: CreateTableDto) {
    Logger.log('create table');
    const result = await this.tablesService.createTable(createTableDto);
    return result;
  }

  @Post('join')
  async join(@Body() joinTableDto: JoinTableDto) {
    Logger.log('join table');
    const result = await this.tablesService.joinTable(joinTableDto);
    return result;
  }

  @Post('rejoin')
  async rejoin() {
    Logger.log('rejoin table');

    const result = await this.tablesService.rejoinTable({
      name: 'From token',
      tableID: 'Also from token',
      userID: 'Guess where this comes from?',
    });
    return result;
  }
}
