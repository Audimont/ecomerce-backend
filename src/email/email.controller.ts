import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get()
  async verifyEmail(@Query('token') token: string) {
    return await this.emailService.verifyEmail(token);
  }

  @Post()
  async resendVerificationEmail(@Body('email') email: string) {
    return await this.emailService.resendVerificationEmail(email);
  }
}
