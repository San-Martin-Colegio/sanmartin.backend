import { IsNotEmpty, IsOptional, IsString, IsInt, MaxLength, Min } from 'class-validator';

export class CreateCategoryDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  groupId: number;
}
