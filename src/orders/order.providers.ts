import { DataSource } from 'typeorm';
import { Repository } from 'src/constant';
import { Order } from './entities/order.entity';

export const usersProviders = [
  {
    provide: Repository.ORDER_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Order),
    Inject: [Repository.DATA_SOURCE],
  },
];
