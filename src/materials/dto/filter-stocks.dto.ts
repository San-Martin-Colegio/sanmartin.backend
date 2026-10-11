import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class FilterStocksDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  groupId?: number;
}
