import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthPayloadDto } from './dto/auth-payload.dto';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/users/entities/user.entity';
import { RefreshToken } from './entities/refresh-tokens.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
  ) {}

  async signup(signupDto: CreateUserDto): Promise<User> {
    return await this.userService.create(signupDto);
  }

  async validateUser(authPayloadDto: AuthPayloadDto) {
    const user = await this.userService.validateUser(
      authPayloadDto.email,
      authPayloadDto.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return await this.generateUserTokens(user);
  }

  private async generateUserTokens(user: User) {
    const payload = { userId: user.id };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = uuidv4();

    /* await this.saveRefreshToken(user, refreshToken); */
    return { accessToken, refreshToken };
  }

  private async saveRefreshToken(user: User, refreshToken: string) {
    const newRefreshToken = this.refreshTokenRepository.create({
      user,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    await this.refreshTokenRepository.save(newRefreshToken);
  }
}
