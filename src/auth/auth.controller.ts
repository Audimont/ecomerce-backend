import { Body, Controller, Post } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { AuthService } from './auth.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: CreateUserDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  async login(@Body() authPayload: AuthPayloadDto) {
    return this.authService.validateUser(authPayload);
  }
}
