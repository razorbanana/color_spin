import { IsInt, IsString, Length, Max, Min } from 'class-validator';

export class CreateTableDto {
  @IsInt()
  @Min(100)
  @Max(10000)
  initialCredits: number;

  @IsInt()
  @Min(5)
  @Max(1000)
  rates: number;

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
