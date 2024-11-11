import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/users/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order) private ordersRepository: Repository<Order>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
    @InjectRepository(User) private usersRepository: Repository<User>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    const { userId, items } = createOrderDto;
    const user = await this.usersRepository.findOneOrFail({
      where: { id: userId },
    });

    let totalPrice = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await this.productsRepository.findOne({
        where: { id: item.productId },
      });
      if (!product) {
        throw new Error('Product not available');
      }

      const orderItem = new OrderItem();
      orderItem.product = product;
      orderItem.quantity = item.quantity;
      orderItem.unitPrice = product.price;
      orderItem.totalPrice = product.price * item.quantity;

      orderItems.push(orderItem);
      totalPrice += orderItem.totalPrice;
    }

    const order = this.ordersRepository.create({
      user,
      items: orderItems,
      totalPrice,
    });

    return await this.ordersRepository.save(order);
  }
}
