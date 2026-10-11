import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
export class CreateMaterialDto { @IsString() @IsNotEmpty() @MaxLength(120) name: string; }
