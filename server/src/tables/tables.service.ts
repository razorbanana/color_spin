import { Injectable, Logger } from '@nestjs/common';
import {
  AddParticipantFields,
  CreateTableFields,
  JoinTableFields,
  RejoinTableFields,
  RemoveParticipantFields,
} from './types';
import { createTableID, createUserID } from 'src/utils/ids';
import { TablesRepository } from './tables.repository';
import { JwtService } from '@nestjs/jwt';
import { Game } from 'shared';

@Injectable()
export class TablesService {
  private readonly logger = new Logger(TablesService.name);
  constructor(
    private readonly tablesRepository: TablesRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createTable(fields: CreateTableFields) {
    const tableID = createTableID();
    const userID = createUserID();

    const createdTable = await this.tablesRepository.createTable({
      ...fields,
      tableID,
      userID,
    });

    const signedString = this.jwtService.sign(
      {
        tableID: createdTable.id,
        name: fields.name,
      },
      {
        subject: userID,
      },
    );

    return {
      table: createdTable,
      accessToken: signedString,
    };
  }

  async joinTable(fields: JoinTableFields) {
    const userID = createUserID();
    this.logger.debug(
      `Fetching table with ID: ${fields.tableID} for user with ID: ${userID}`,
    );

    const joinedTable = await this.tablesRepository.getTable(fields.tableID);

    const signedString = this.jwtService.sign(
      {
        tableID: joinedTable.id,
        name: fields.name,
      },
      {
        subject: userID,
      },
    );

    return {
      table: joinedTable,
      accessToken: signedString,
    };
  }

  async rejoinTable(fields: RejoinTableFields) {
    this.logger.debug(
      `Rejoining poll with ID: ${fields.tableID} for user with ID: ${fields.userID} with name: ${fields.name}`,
    );

    const joinedPoll = await this.tablesRepository.addParticipant(fields);

    return joinedPoll;
  }

  async addParticipant(
    addParticipantFields: AddParticipantFields,
  ): Promise<Game> {
    return this.tablesRepository.addParticipant(addParticipantFields);
  }

  async removeParticipant(
    removeParticipantFields: RemoveParticipantFields,
  ): Promise<Game | void> {
    const { tableID, userID } = removeParticipantFields;
    const table = await this.tablesRepository.getTable(tableID);
    if (!table.hasStarted) {
      const updatedTable = await this.tablesRepository.removeParticipant(
        tableID,
        userID,
      );
      return updatedTable;
    }
  }
}
