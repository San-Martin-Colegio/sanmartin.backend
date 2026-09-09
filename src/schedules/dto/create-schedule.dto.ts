import { IsNotEmpty, IsOptional, IsString, IsInt, Min, Max } from 'class-validator';

export class CreateScheduleDto {
  @IsNotEmpty()
  @IsInt()
  teacherId: number;

  @IsNotEmpty()
  @IsString()
  day: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(9)
  block: number;

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
