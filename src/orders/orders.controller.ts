import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '@common/dto/pagination.dto';
import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { IPaginationOptions } from 'nestjs-typeorm-paginate';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getOrders(@Query() PaginationDto: PaginationDto) {
    const options = {
      page: PaginationDto.page,
      limit: PaginationDto.limit,
    };
    return await this.ordersService.getOrders(options);
  }

  @Get('my-orders')
  @UseGuards(JwtAuthGuard)
  @UsePipes(new ValidationPipe({ transform: true }))
  async getOrdersByUser(
    @CurrentUser() user,
    @Query() PaginationDto: PaginationDto,
  ) {
    const options: IPaginationOptions = {
      page: PaginationDto.page,
      limit: PaginationDto.limit,
    };
    return await this.ordersService.getOrdersByUser(user.id, options);
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.createOrder(createOrderDto);
  }
}
