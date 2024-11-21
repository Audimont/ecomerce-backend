import { Controller, Get } from '@nestjs/common';
import { ResendService } from 'nestjs-resend';

@Controller('email')
export class EmailController {
  constructor(private readonly resendService: ResendService) {}

  @Get()
  async sendVerificationEmail() {
    const result = await this.resendService.emails.send({
      from: 'onboarding@resend.dev',
      to: 'desarrolloaudimont@gmail.com',
      subject: 'Hello from NestJS',
      html: '<p>This email was sent using Resend and NestJS!</p>',
    });

    return result;
  }
}
