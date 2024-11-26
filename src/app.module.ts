import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailModule } from '@emails/email.module';
import { AuthModule } from '@auth/auth.module';
import { OrdersModule } from '@orders/orders.module';
import { DatabaseModule } from 'database/database.module';
import { ProductsModule } from '@products/products.module';
import { UsersModule } from '@users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    DatabaseModule,
    ProductsModule,
    OrdersModule,
    AuthModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
