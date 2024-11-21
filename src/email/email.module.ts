import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ResendModule } from 'nestjs-resend';
import { EmailController } from './email.controller';
import { EmailService } from './email.service';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    ResendModule.forRootAsync({
      useFactory: async (configService: ConfigService) => ({
        apiKey: configService.getOrThrow('RESEND_API_KEY'),
      }),
      inject: [ConfigService],
    }),
    JwtModule,
    UsersModule,
  ],
  providers: [EmailService],
  exports: [EmailService],
  controllers: [EmailController],
})
export class EmailModule {}
