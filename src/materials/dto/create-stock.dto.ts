import { IsInt, IsNotEmpty, Min } from 'class-validator';
export class CreateStockDto { @IsInt() @IsNotEmpty() groupId: number; @IsInt() @IsNotEmpty() materialId: number; @IsInt() @Min(1) quantity: number; }
