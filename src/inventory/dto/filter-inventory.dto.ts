import { IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class FilterInventoryDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  groupId?: string;

  @IsOptional()
  @IsString()
  @Matches(/^\d+$/)
  categoryId?: string;

  @IsOptional()
  @IsString()
  @IsIn(['Bueno', 'Regular', 'Malo'])
  status?: string;

  @IsOptional()
  @IsString()
  @IsIn(['material', 'computer'])
  assetType?: string;
}
