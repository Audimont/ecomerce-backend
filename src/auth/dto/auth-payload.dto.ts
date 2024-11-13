import { IsEmail, IsString } from 'class-validator';

export class AuthPayloadDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
