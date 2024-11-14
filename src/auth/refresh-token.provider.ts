import { DataSource } from 'typeorm';
import { Repository } from 'src/constant';
import { RefreshToken } from './entities/refresh-tokens.entity';

export const refreshTokenRepository = [
  {
    provide: Repository.REFRESH_TOKEN,
    useFactory: (dataSource: DataSource) =>
      dataSource.getRepository(RefreshToken),
    Inject: [Repository.DATA_SOURCE],
  },
];
