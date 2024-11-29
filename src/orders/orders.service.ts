import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from '@users/entities/user.entity';
import { Product } from '@products/entities/product.entity';
import { InstallationSlot } from './entities/installation-slot.entity';
import { InstallationSlotStatus } from '@common/enums/installation-slot-status.enum';
import {
  Pagination,
  IPaginationOptions,
  paginate,
} from 'nestjs-typeorm-paginate';

@Injectable()
export class OrdersService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Order)
    private readonly ordersRepository: Repository<Order>,
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(InstallationSlot)
    private readonly installationSlotsRepository: Repository<InstallationSlot>,
  ) {}

  async getOrders(options: IPaginationOptions): Promise<Pagination<Order>> {
    return paginate<Order>(this.ordersRepository, options, {
      relations: ['user', 'items', 'items.product', 'items.installationSlot'],
      order: { createdAt: 'DESC' },
    });
  }

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    return await this.dataSource.transaction(async (manager) => {
      const { userId, items } = createOrderDto;

      const usersRepository = manager.getRepository(User);
      const productsRepository = manager.getRepository(Product);
      const ordersRepository = manager.getRepository(Order);
      const installationSlotsRepository =
        manager.getRepository(InstallationSlot);

      const user = await usersRepository.findOne({
        where: { id: userId },
      });
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }

      let totalPrice = 0;
      const orderItems: OrderItem[] = [];

      for (const item of items) {
        const product = await productsRepository.findOne({
          where: { id: item.productId },
        });

        if (!product) {
          throw new HttpException(
            `Product with ID ${item.productId} not available`,
            HttpStatus.NOT_FOUND,
          );
        }

        const orderItem = new OrderItem();
        orderItem.product = product;
        orderItem.quantity = item.quantity;
        orderItem.unitPrice = product.price;
        orderItem.totalPrice = product.price * item.quantity;
        orderItem.installationRequested = false;

        if (product.installable && item.installationRequested) {
          orderItem.installationRequested = true;

          const installationSlot = await installationSlotsRepository.findOne({
            where: {
              id: item.installationSlotId,
              status: InstallationSlotStatus.AVAILABLE,
            },
            lock: { mode: 'pessimistic_write' },
          });

          if (!installationSlot) {
            throw new HttpException(
              `Installation slot with ID ${item.installationSlotId} not available`,
              HttpStatus.NOT_FOUND,
            );
          }

          orderItem.installationSlot = installationSlot;
          installationSlot.status = InstallationSlotStatus.BOOKED;
          installationSlot.orderItem = orderItem;

          await installationSlotsRepository.save(installationSlot);
        }

        orderItems.push(orderItem);
        totalPrice += orderItem.totalPrice;
      }

      const order = ordersRepository.create({
        user,
        items: orderItems,
        totalPrice,
      });

      return await ordersRepository.save(order);
    });
  }
}
