import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { PasswordService } from 'src/users/password.service';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly emailService: EmailService,
  ) {}

  async signup(signupDto: CreateUserDto): Promise<User> {
    const user = await this.userService.create(signupDto);
    const userWithoutPassword = { ...user, password: undefined };
    await this.emailService.sendVerificationEmail(user);
    return userWithoutPassword;
  }

  async login(user: User) {
    const expiresAccessCookie = new Date(
      Date.now() +
        parseInt(
          this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRATION'),
        ),
    );

    const expiresRefreshCookie = new Date(
      Date.now() +
        parseInt(
          this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRATION'),
        ),
    );

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
      isVerified: user.isVerified,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_ACCESS_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_ACCESS_EXPIRATION')}ms`,
    });

    const refreshToken = this.jwtService.sign(tokenPayload, {
      secret: this.configService.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: `${this.configService.getOrThrow('JWT_REFRESH_EXPIRATION')}ms`,
    });

    const hasRefreshToken =
      await this.passwordService.hashPassword(refreshToken);
    await this.userService.update(user.id, { refreshToken: hasRefreshToken });

    return {
      accessToken,
      refreshToken,
      expiresAccessCookie,
      expiresRefreshCookie,
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.userService.findOneByEmail(email);

    const isPasswordValid = await this.passwordService.comparePassword(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }

  async verifyRefreshToken(refreshToken: string, userId: number) {
    const user = await this.userService.findOneForAuth(userId);

    if (!user) {
      throw new UnauthorizedException('Invalid user');
    }

    const isRefreshTokenValid = await this.passwordService.comparePassword(
      refreshToken,
      user.refreshToken,
    );

    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    return user;
  }
}
