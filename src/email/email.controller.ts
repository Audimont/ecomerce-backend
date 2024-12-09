import { Controller, Get, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('verify-email')
  async verifyEmail(@Body('token') token: string) {
    return await this.emailService.verifyEmail(token);
  }

  @Post('password-reset-request')
  async passwordResetRequest(@Body('email') email: string) {
    return this.emailService.sendPasswordResetEmail(email);
  }

  @Post('resend-verification-email')
  async resendVerificationEmail(@Body('email') email: string) {
    return await this.emailService.resendVerificationEmail(email);
  }
}
