import { IsInt, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class UpdateComputerDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @Type(() => Number) @IsInt() areaId?: number;
  @IsOptional() @IsString() observation?: string;
}
