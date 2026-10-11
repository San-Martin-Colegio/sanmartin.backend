import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class UpdateComputerDto {
  @IsOptional() @IsString() @MaxLength(100) code?: string;
  @IsOptional() @IsString() @IsIn(['Bueno', 'Regular', 'Malo']) status?: string;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) areaId?: number;
  @IsOptional() @IsString() @MaxLength(1000) observation?: string;
}
