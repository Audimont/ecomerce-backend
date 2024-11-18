import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { PasswordService } from 'src/users/password.service';
import { ConfigService } from '@nestjs/config';
import { TokenPayload } from './interfaces/token-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(signupDto: CreateUserDto): Promise<User> {
    const user = await this.userService.create(signupDto);
    const userWithoutPassword = { ...user, password: undefined };
    return userWithoutPassword;
  }

  async login(user: User) {
    const expiresAccessCookie = new Date(
      Date.now() +
        parseInt(
          this.configService.getOrThrow<string>('JWT_ACCESS_EXPIRATION'),
        ),
    );

    const tokenPayload: TokenPayload = {
      id: user.id,
      email: user.email,
    };

    const accessToken = this.jwtService.sign(tokenPayload, {
      expiresIn: `${this.configService.getOrThrow('JWT_ACCESS_EXPIRATION')}ms`,
    });

    return {
      access_token: accessToken,
      expires_in: expiresAccessCookie,
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
}
