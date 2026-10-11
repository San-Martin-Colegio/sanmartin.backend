import { IsEmail, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateTeacherDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

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
  @MaxLength(250)
  address?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  specialty?: string;

  @IsOptional()
  @IsIn([
    'Inicial',
    'Primaria',
    'Secundaria',
    'Administrativo',
    'Directivo',
    'Auxiliares',
    'Vigilantes',
  ])
  educationLevel?: string;

  @IsOptional()
  @IsIn(['Activo', 'Inactivo'])
  status?: string;
}
