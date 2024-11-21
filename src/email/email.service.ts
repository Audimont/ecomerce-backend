import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResendService } from 'nestjs-resend';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class EmailService {
  private readonly email: string = 'onboarding@resend.dev';
  private readonly verificationUrl: string =
    'http://localhost:4000/email?token=';

  constructor(
    private readonly resendService: ResendService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}

  async VerificationEmail(user: User) {
    try {
      console.log(user);
      const token = this.jwtService.sign({ email: user.email }); //agregar jwt secret key
      await this.userService.update(user.id, { emailVerificationToken: token });
      const verificationUrl = `${this.verificationUrl}${token}`;
      await this.resendService.emails.send({
        from: this.email,
        to: user.email,
        subject: 'Verify your email',
        text: `Click the link to verify your email: ${verificationUrl}`,
      });
    } catch (error) {
      console.error('Error in VerificationEmail:', error);
      throw new Error('Failed to send verification email');
    }
  }
}
