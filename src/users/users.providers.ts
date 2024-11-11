import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'src/constant';

export const usersProviders = [
  {
    provide: Repository.USERS_REPOSITORY,
    useFactory: (dataSource: DataSource) => dataSource.getRepository(User),
    Inject: [Repository.DATA_SOURCE],
  },
];
