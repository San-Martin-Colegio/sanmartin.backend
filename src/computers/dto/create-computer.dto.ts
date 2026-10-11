import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateComputerDto {
  @IsString() @IsNotEmpty() @MaxLength(100) code: string;
  @IsString() @IsNotEmpty() @IsIn(['Bueno', 'Regular', 'Malo']) status: string;
  @Type(() => Number) @IsInt() @Min(1) areaId: number;
  @IsOptional() @IsString() @MaxLength(1000) observation?: string;
}
