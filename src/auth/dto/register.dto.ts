import { IsEmail, IsNotEmpty, MinLength, IsEnum } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6, {
    message: 'Le mot de passe doit contenir au moins 6 caractères',
  })
  password: string;

  @IsEnum(['CANDIDATE', 'COMPANY'], {
    message: 'Le rôle doit être CANDIDATE ou COMPANY',
  })
  role: 'CANDIDATE' | 'COMPANY';
}
