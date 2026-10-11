import { IsInt, IsNotEmpty, Min } from 'class-validator';
export class CreateStockDto { @IsInt() @IsNotEmpty() @Min(1) groupId: number; @IsInt() @IsNotEmpty() @Min(1) materialId: number; @IsInt() @Min(1) quantity: number; }
