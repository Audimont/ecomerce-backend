import { DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'constant';

export const usersProviders = [
  {
    provide: Repository.ORDER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Order),
    Inject: [Repository.DATA_SOURCE],
  },
];
