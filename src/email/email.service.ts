import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { ResendService } from 'nestjs-resend';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class EmailService {
  private readonly email: string = 'onboarding@resend.dev';
  private readonly verificationUrl: string =
    'http://localhost:4000/email?token=';
  private readonly secret: string =
    this.configService.getOrThrow('JWT_EMAIL_SECRET');

  constructor(
    private readonly resendService: ResendService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async sendVerificationEmail(user: User) {
    try {
      const token = this.jwtService.sign(
        { email: user.email },
        {
          secret: this.secret,
          expiresIn: '24h',
        },
      );

      const verificationUrl = `${this.verificationUrl}${token}`;
      await this.resendService.emails.send({
        from: this.email,
        to: user.email,
        subject: 'Verify your email',
        text: `Click the link to verify your email: ${verificationUrl}`,
      });
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw new BadRequestException('Failed to send verification email.');
    }
  }

  async verifyEmail(token: string) {
    try {
      const payload = this.jwtService.verify(token, { secret: this.secret });

      const user = await this.usersService.findOneByEmail(payload.email);
      if (!user) {
        throw new NotFoundException('User not found.');
      }

      if (user.isVerified) {
        return { message: 'Email already verified.' };
      }

      await this.usersService.update(user.id, { isVerified: true });
      return { message: 'Email successfully verified.' };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException(
          'Token has expired. Please request a new verification email.',
        );
      } else {
        throw new BadRequestException('Invalid token.');
      }
    }
  }

  async resendVerificationEmail(email: string) {
    const user = await this.usersService.findOneByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found.');
    }

    if (user.isVerified) {
      return { message: 'Email is already verified.' };
    }

    await this.sendVerificationEmail(user);
    return { message: 'Verification email resent successfully.' };
  }
}
