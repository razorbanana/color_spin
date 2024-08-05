import { Injectable } from '@nestjs/common';
import { CreateTableFields, JoinTableFields, RejoinTableFields } from './types';
import { createTableID, createUserID } from 'src/utils/ids';

@Injectable()
export class TablesService {
  async createTable(fields: CreateTableFields) {
    const tableID = createTableID();
    const userID = createUserID();

    return {
      ...fields,
      tableID,
      userID,
    };
  }

  async joinTable(fields: JoinTableFields) {
    const userID = createUserID();
    return {
      ...fields,
      userID,
    };
  }

  async rejoinTable(fields: RejoinTableFields) {
    return fields;
  }
}
