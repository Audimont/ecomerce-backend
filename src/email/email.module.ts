import { Module } from '@nestjs/common';
import { MailgunModule } from 'nestjs-mailgun';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EmailService } from './email.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MailgunModule.forAsyncRoot({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        username: 'api',
        key: configService.get<string>('MAILGUN_API_KEY'),
        url: configService.get<string>(
          'MAILGUN_API_URL',
          'https://api.mailgun.net',
        ),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
