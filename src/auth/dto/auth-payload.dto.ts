import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class AuthPayloadDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password should not be empty' })
  password: string;
}
