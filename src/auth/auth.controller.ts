import { Body, Controller, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { CreateUserDto } from '@users/dto/create-user.dto';
import { LocalGuard } from './guards/local.guard';
import { User } from '@users/entities/user.entity';
import { PasswordResetDto } from './dto/password-reset.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  async signup(@Body() signupDto: CreateUserDto) {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @UseGuards(LocalGuard)
  async login(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginData = await this.authService.login(user);

    res.cookie('Authentication', loginData.accessToken, {
      httpOnly: true,
      // secure: true,
      expires: loginData.expiresAccessCookie,
    });

    res.cookie('Refresh', loginData.refreshToken, {
      httpOnly: true,
      // secure: true,
      expires: loginData.expiresRefreshCookie,
    });

    return { message: 'Login successful' };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  async refresh(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) res: Response,
  ) {
    const loginData = await this.authService.login(user);

    res.cookie('Authentication', loginData.accessToken, {
      httpOnly: true,
      // secure: true,
      expires: loginData.expiresAccessCookie,
    });

    res.cookie('Refresh', loginData.refreshToken, {
      httpOnly: true,
      // secure: true,
      expires: loginData.expiresRefreshCookie,
    });

    return { message: 'Refresh successful' };
  }

  @Post('password-reset')
  async passwordReset(@Body() passwordResetDto: PasswordResetDto) {
    return this.authService.passwordReset(passwordResetDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('Authentication');
    return { message: 'Logout successful' };
  }
}
