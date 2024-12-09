import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class PasswordResetDto {
  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty' })
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  @Matches(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/, {
    message:
      'Password must contain at least one number, one lowercase letter, and one uppercase letter',
  })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Token should not be empty' })
  token: string;
}
