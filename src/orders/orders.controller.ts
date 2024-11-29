import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PaginationDto } from '@common/dto/pagination.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  @UsePipes(new ValidationPipe({ transform: true }))
  async getOrders(@Query() PaginationDto: PaginationDto) {
    const options = {
      page: PaginationDto.page,
      limit: PaginationDto.limit,
    };
    return await this.ordersService.getOrders(options);
  }

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto) {
    return await this.ordersService.createOrder(createOrderDto);
  }
}
