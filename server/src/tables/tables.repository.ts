import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { IORedisKey } from 'src/redis.module';
import { Game } from 'shared';
import {
  AddParticipantData,
  CreateParticipantData,
  CreateTableData,
  UpdateParticipantCreditsData,
} from './types';

@Injectable()
export class TablesRepository {
  private readonly ttl: string;
  private readonly logger = new Logger(TablesRepository.name);

  constructor(
    configService: ConfigService,
    @Inject(IORedisKey) private readonly redisClient: Redis,
  ) {
    this.ttl = configService.get('SESSION_DURATION');
  }

  async createTable({
    tableID,
    initialCredits,
    min_bet,
    max_bet,
    name,
    userID,
  }: CreateTableData): Promise<Game> {
    const initialTable = {
      id: tableID,
      initialCredits,
      min_bet,
      max_bet,
      name,
      participants: {},
      adminID: userID,
      hasStarted: false,
    };

    this.logger.log(
      `Creating new table: ${JSON.stringify(initialTable, null, 2)} with TTL ${
        this.ttl
      }`,
    );

    const key = `tables:${tableID}`;

    try {
      await this.redisClient
        .multi([
          ['send_command', 'JSON.SET', key, '.', JSON.stringify(initialTable)],
          ['expire', key, this.ttl],
        ])
        .exec();
      return initialTable;
    } catch (e) {
      this.logger.error(
        `Failed to add table ${JSON.stringify(initialTable)}\n${e}`,
      );
      throw new InternalServerErrorException();
    }
  }

  async getTable(tableID: string): Promise<Game> {
    this.logger.log(`Attempting to get table with: ${tableID}`);

    const key = `tables:${tableID}`;

    try {
      const currentTable = await this.redisClient.send_command(
        'JSON.GET',
        key,
        '.',
      );

      this.logger.verbose(currentTable);

      // if (currentTable?.hasStarted) {
      //   throw new BadRequestException('The table has already started');
      // }

      return JSON.parse(currentTable);
    } catch (e) {
      this.logger.error(`Failed to get tableID ${tableID}`);
      throw e;
    }
  }

  async addParticipant({
    tableID,
    userID,
    name,
  }: AddParticipantData): Promise<Game> {
    this.logger.log(
      `Attempting to add a participant with userID/name: ${userID}/${name} to tableID: ${tableID}`,
    );

    const key = `tables:${tableID}`;
    const participantPath = `.participants.${userID}`;
    const table = await this.getTable(tableID);

    const newParticipant: CreateParticipantData = {
      name,
      credits: table.initialCredits,
      chosenColor: null,
    };

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        participantPath,
        JSON.stringify(newParticipant),
      );

      return this.getTable(tableID);
    } catch (e) {
      this.logger.error(
        `Failed to add a participant with userID/name: ${userID}/${name} to tableID: ${tableID}`,
      );
      throw e;
    }
  }

  async updateParticipantCredits({
    name,
    userID,
    tableID,
    credits,
  }: UpdateParticipantCreditsData) {
    this.logger.log(
      `Attempting to update credits of a participant with userID: ${userID}, new credits: ${credits}, tableID: ${tableID}`,
    );

    const key = `tables:${tableID}`;
    const participantPath = `.participants.${userID}`;
    const updatedParticipant = {
      name,
      credits,
      chosenColor: null,
    };

    try {
      await this.redisClient.send_command(
        'JSON.SET',
        key,
        participantPath,
        JSON.stringify(updatedParticipant),
      );

      return this.getTable(tableID);
    } catch (e) {
      this.logger.error(
        `Failed to update credits of a participant with userID: ${userID}, new credits: ${credits}, tableID: ${tableID}`,
      );
      throw new InternalServerErrorException(
        `Failed to update credits of a participant`,
      );
    }
  }

  async removeParticipant(tableID: string, userID: string): Promise<Game> {
    this.logger.log(
      `Attempting to remove a participant with userID: ${userID} from tableID: ${tableID}`,
    );

    const key = `tables:${tableID}`;
    const participantPath = `.participants.${userID}`;

    try {
      await this.redisClient.send_command('JSON.DEL', key, participantPath);

      return this.getTable(tableID);
    } catch (e) {
      this.logger.error(
        `Failed to remove a participant with userID: ${userID} from tableID: ${tableID}`,
      );
      throw new InternalServerErrorException('Failed to remove participant');
    }
  }
}
