import { Injectable, Logger } from '@nestjs/common';
import { CreateTableFields, JoinTableFields, RejoinTableFields } from './types';
import { createTableID, createUserID } from 'src/utils/ids';
import { TablesRepository } from './tables.repository';

@Injectable()
export class TablesService {
  private readonly logger = new Logger(TablesService.name);
  constructor(private readonly tablesRepository: TablesRepository) {}

  async createTable(fields: CreateTableFields) {
    const tableID = createTableID();
    const userID = createUserID();

    const createdTable = await this.tablesRepository.createTable({
      ...fields,
      tableID,
      userID,
    });

    return {
      table: createdTable,
    };
  }

  async joinTable(fields: JoinTableFields) {
    const userID = createUserID();
    this.logger.debug(
      `Fetching table with ID: ${fields.tableID} for user with ID: ${userID}`,
    );

    const joinedPoll = await this.tablesRepository.getTable(fields.tableID);

    // TODO - create access Token

    return {
      poll: joinedPoll,
      // accessToken: signedString,
    };
  }

  async rejoinTable(fields: RejoinTableFields) {
    return fields;
  }
}
