import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateTableDto {
  @IsInt()
  @Min(10)
  @Max(100000)
  initialCredits: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  min_bet: number;

  @IsInt()
  @Min(1)
  @Max(1000)
  max_bet: number;

  @IsString()
  @Length(1, 25)
  name: string;
}

export class JoinTableDto {
  @IsString()
  @Length(6, 6)
  tableID: string;

  @IsString()
  @Length(1, 25)
  name: string;
}
