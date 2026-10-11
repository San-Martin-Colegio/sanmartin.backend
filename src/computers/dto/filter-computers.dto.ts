import { IsIn, IsOptional, IsString, Length } from 'class-validator';

export class FilterComputersDto {
  @IsOptional()
  @IsIn(['Bueno', 'Regular', 'Malo'])
  status?: string;

  @IsOptional()
  @IsString()
  @Length(1, 80)
  q?: string;
}
