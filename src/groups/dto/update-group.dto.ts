import { IsOptional, IsString, IsInt, Max, MaxLength, Min } from 'class-validator';

export class UpdateGroupDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(10_000)
  order?: number;
}
