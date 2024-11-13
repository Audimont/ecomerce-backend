import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { PasswordService } from './password.service';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  exports: [UsersService, PasswordService],
  controllers: [UsersController],
  providers: [UsersService, PasswordService],
})
export class UsersModule {}
