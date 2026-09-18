import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
export class CreateComputerDto {
  @IsString() @IsNotEmpty() code: string;
  @IsString() @IsNotEmpty() status: string;
  @Type(() => Number) @IsInt() areaId: number;
  @IsOptional() @IsString() observation?: string;
}
