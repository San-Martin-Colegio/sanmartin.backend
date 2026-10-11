import { IsEmail, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateSchoolDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  @Matches(/^[0-9+()\s/-]+$/)
  phone?: string;

  @IsOptional()
  @IsString()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  principal?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  mission?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  vision?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  values?: string;
}
