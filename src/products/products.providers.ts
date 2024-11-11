import { DataSource } from 'typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'src/constant';

export const usersProviders = [
  {
    provide: Repository.PRODUCTS_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(Product),
    Inject: [Repository.DATA_SOURCE],
  },
];
