import { IsIn, IsOptional, IsString, IsInt, MaxLength, Min } from 'class-validator';

export class UpdateInventoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoryId?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsString()
  @IsIn(['material', 'computer'])
  assetType?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Bueno', 'Regular', 'Malo'])
  status?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  location?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}
