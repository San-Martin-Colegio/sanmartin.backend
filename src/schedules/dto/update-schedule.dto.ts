import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  day?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(9)
  block?: number;

  @IsOptional()
  @IsString()
  subject?: string;

  @IsOptional()
  @IsString()
  gradeSection?: string;

  @IsOptional()
  @IsString()
  classroom?: string;
}
