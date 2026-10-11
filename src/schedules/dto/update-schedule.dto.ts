import { IsIn, IsOptional, IsString, IsInt, Min, Max, MaxLength } from 'class-validator';

export class UpdateScheduleDto {
  @IsOptional()
  @IsString()
  @IsIn(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'])
  day?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  block?: number;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  subject?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  gradeSection?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  classroom?: string;
}
