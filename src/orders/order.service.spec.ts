import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { Product } from '@products/entities/product.entity';
import { User } from '@users/entities/user.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: Repository<Order>;
  let usersRepository: Repository<User>;
  let productsRepository: Repository<Product>;

  const mockOrdersRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  const mockProductsRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: mockOrdersRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductsRepository,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    ordersRepository = module.get<Repository<Order>>(getRepositoryToken(Order));
    usersRepository = module.get<Repository<User>>(getRepositoryToken(User));
    productsRepository = module.get<Repository<Product>>(
      getRepositoryToken(Product),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createOrder', () => {
    it('should create an order', async () => {
      const createOrderDto = {
        userId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 3 },
        ],
      };

      const mockUser = { id: 1, name: 'John Doe' };
      const mockProduct1 = { id: 1, name: 'Product 1', price: 10 };
      const mockProduct2 = { id: 2, name: 'Product 2', price: 20 };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockProductsRepository.findOne
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      mockOrdersRepository.create.mockReturnValue({
        id: 1,
        user: mockUser,
        items: expect.any(Array),
        totalPrice: 80,
      });

      mockOrdersRepository.save.mockResolvedValue({
        id: 1,
        user: mockUser,
        items: expect.any(Array),
        totalPrice: 80,
      });

      const result = await service.createOrder(createOrderDto);

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(productsRepository.findOne).toHaveBeenCalledTimes(2);
      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 2 },
      });
      expect(ordersRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        items: expect.any(Array),
        totalPrice: 80,
      });
      expect(ordersRepository.save).toHaveBeenCalledWith(expect.any(Object));

      expect(result).toEqual({
        id: 1,
        user: mockUser,
        items: expect.any(Array),
        totalPrice: 80,
      });
    });
  });
});
