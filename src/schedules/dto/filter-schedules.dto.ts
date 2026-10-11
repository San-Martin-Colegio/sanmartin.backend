import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class FilterSchedulesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  teacherId?: number;
}
