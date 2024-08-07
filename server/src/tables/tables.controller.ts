import { Body, Controller, Logger, Post, Req, UseGuards } from '@nestjs/common';
import { CreateTableDto, JoinTableDto } from './dtos';
import { TablesService } from './tables.service';
import { ControllerAuthGuard } from './guards/controller-auth.guard';
import { RequestWithAuth } from './types';

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

  @UseGuards(ControllerAuthGuard)
  @Post('rejoin')
  async rejoin(@Req() request: RequestWithAuth) {
    Logger.log('rejoin table');
    const { tableID, name, userID } = request;
    const result = await this.tablesService.rejoinTable({
      name,
      tableID,
      userID,
    });
    return result;
  }
}
