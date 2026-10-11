import { IsNotEmpty, IsString, Length, Matches, MaxLength } from 'class-validator';

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  @Length(3, 80)
  @Matches(/^[\p{L}\p{N}_.-]+$/u)
  username: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(128)
  password: string;
}
