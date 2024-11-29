import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { Repository } from 'typeorm';
import { Product } from '@products/entities/product.entity';
import { User } from '@users/entities/user.entity';
import { HttpException, HttpStatus } from '@nestjs/common';
import { OrderItem } from './entities/order-item.entity';

describe('OrdersService', () => {
  let service: OrdersService;
  let ordersRepository: Repository<Order>;
  let usersRepository: Repository<User>;
  let productsRepository: Repository<Product>;

  const mockOrdersRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockUsersRepository = {
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
          useValue: mockUsersRepository,
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
    it('debería crear una orden exitosamente', async () => {
      // Datos de entrada
      const createOrderDto = {
        userId: 1,
        items: [
          { productId: 1, quantity: 2 },
          { productId: 2, quantity: 3 },
        ],
      };

      // Datos simulados
      const mockUser: User = { id: 1, name: 'John Doe' } as User;
      const mockProduct1: Product = {
        id: 1,
        name: 'Product 1',
        price: 10,
      } as Product;
      const mockProduct2: Product = {
        id: 2,
        name: 'Product 2',
        price: 20,
      } as Product;

      // Configuración de los mocks
      usersRepository.findOne.mockResolvedValue(mockUser);
      productsRepository.findOne
        .mockResolvedValueOnce(mockProduct1)
        .mockResolvedValueOnce(mockProduct2);
      ordersRepository.save.mockImplementation((order) =>
        Promise.resolve({ id: 1, ...order }),
      );

      // Cálculo esperado
      const expectedTotalPrice =
        mockProduct1.price * createOrderDto.items[0].quantity +
        mockProduct2.price * createOrderDto.items[1].quantity;

      // Ejecución del método
      const result = await service.createOrder(createOrderDto);

      // Verificaciones
      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(productsRepository.findOne).toHaveBeenCalledTimes(2);
      expect(productsRepository.findOne).toHaveBeenNthCalledWith(1, {
        where: { id: 1 },
      });
      expect(productsRepository.findOne).toHaveBeenNthCalledWith(2, {
        where: { id: 2 },
      });
      expect(ordersRepository.create).toHaveBeenCalledWith({
        user: mockUser,
        items: expect.any(Array),
        totalPrice: expectedTotalPrice,
      });
      expect(ordersRepository.save).toHaveBeenCalledWith(expect.any(Object));

      // Verificación del resultado
      expect(result).toEqual({
        id: 1,
        user: mockUser,
        items: [
          {
            product: mockProduct1,
            quantity: 2,
            unitPrice: 10,
            totalPrice: 20,
          },
          {
            product: mockProduct2,
            quantity: 3,
            unitPrice: 20,
            totalPrice: 60,
          },
        ],
        totalPrice: expectedTotalPrice,
        status: 'pending', // Valor por defecto
        createdAt: expect.any(Date),
      });
    });

    it('debería lanzar una excepción si el usuario no existe', async () => {
      const createOrderDto = {
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
      };

      usersRepository.findOne.mockResolvedValue(null);

      await expect(service.createOrder(createOrderDto)).rejects.toThrowError(
        new HttpException('User not found', HttpStatus.NOT_FOUND),
      );

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('debería lanzar una excepción si un producto no está disponible', async () => {
      const createOrderDto = {
        userId: 1,
        items: [{ productId: 1, quantity: 2 }],
      };
      const mockUser: User = { id: 1, name: 'John Doe' } as User;

      usersRepository.findOne.mockResolvedValue(mockUser);
      productsRepository.findOne.mockResolvedValue(null);

      await expect(service.createOrder(createOrderDto)).rejects.toThrowError(
        new HttpException(
          'Product with ID 1 not available',
          HttpStatus.NOT_FOUND,
        ),
      );

      expect(usersRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(productsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });
  });

  describe('getOrders', () => {
    it('debería retornar un arreglo de órdenes con sus relaciones', async () => {
      // Datos simulados
      const mockUser: User = { id: 1, name: 'John Doe' } as User;
      const mockProduct1: Product = {
        id: 1,
        name: 'Product 1',
        price: 10,
      } as Product;
      const mockProduct2: Product = {
        id: 2,
        name: 'Product 2',
        price: 20,
      } as Product;

      const mockOrderItem1: OrderItem = {
        id: 1,
        quantity: 2,
        unitPrice: 10,
        totalPrice: 20,
        product: mockProduct1,
      } as OrderItem;

      const mockOrderItem2: OrderItem = {
        id: 2,
        quantity: 3,
        unitPrice: 20,
        totalPrice: 60,
        product: mockProduct2,
      } as OrderItem;

      const mockOrder: Order = {
        id: 1,
        totalPrice: 80,
        status: 'pending',
        createdAt: new Date(),
        user: mockUser,
        items: [mockOrderItem1, mockOrderItem2],
      } as Order;

      ordersRepository.find.mockResolvedValue([mockOrder]);

      // Ejecución del método
      const result = await service.getOrders();

      // Verificaciones
      expect(ordersRepository.find).toHaveBeenCalledWith({
        relations: ['user', 'items', 'items.product'],
      });
      expect(result).toEqual([mockOrder]);
    });
  });
});
