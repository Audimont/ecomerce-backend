import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { HttpException } from '@nestjs/common';

const mockProductRepository = {
  findOneBy: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  delete: jest.fn(),
};

const mockProducts = [
  {
    id: 1,
    name: 'Product 1',
    description: 'Product One Description',
    price: 9.99,
  },
  {
    id: 2,
    name: 'Product 2',
    description: 'Product Two Description',
    price: 19.99,
  },
  {
    id: 3,
    name: 'Product 3',
    description: 'Product Three Description',
    price: 29.99,
  },
];

describe('ProductsService', () => {
  let service: ProductsService;
  let repository: Repository<Product>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useValue: mockProductRepository,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    repository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a product', async () => {
      const createProductDto = {
        name: 'New Product',
        description: 'Description',
        price: 9.99,
      };

      mockProductRepository.findOneBy
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 1, ...createProductDto });
      mockProductRepository.save.mockResolvedValue({
        id: 1,
        ...createProductDto,
      });
      const result = await service.create(createProductDto);

      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({
        name: createProductDto.name,
      });
      expect(mockProductRepository.save).toHaveBeenCalledWith(createProductDto);
      expect(result).toEqual({ id: 1, ...createProductDto });

      await expect(service.create(createProductDto)).rejects.toThrow(
        HttpException,
      );
      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({
        name: createProductDto.name,
      });
    });
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      const products = mockProducts;
      mockProductRepository.find.mockResolvedValue(products);

      const result = await service.findAll();

      expect(mockProductRepository.find).toHaveBeenCalled();
      expect(result).toEqual(products);
    });
  });

  describe('findOne', () => {
    it('should return a product by id', async () => {
      const product = {
        id: 2,
        name: 'Testing Product',
        description: 'testing product description',
        price: 12,
      };
      mockProductRepository.findOneBy.mockResolvedValue(product);

      const result = await service.findOne(2);
      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
      expect(result).toEqual(product);
    });

    it('should throw an error if product not found', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(2)).rejects.toThrow(HttpException);
      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
    });
  });

  describe('update', () => {
    it('should update a product', async () => {
      const product = {
        id: 2,
        name: 'Testing Product',
        description: 'testing product description',
        price: 12,
      };
      const updateProductDto = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 15,
      };

      mockProductRepository.findOneBy.mockResolvedValue(product);
      mockProductRepository.save.mockResolvedValue({
        ...product,
        ...updateProductDto,
      });

      const result = await service.update(2, updateProductDto);
      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
      expect(mockProductRepository.save).toHaveBeenCalledWith({
        ...product,
        ...updateProductDto,
      });
      expect(result).toEqual({ id: 2, ...updateProductDto });
    });

    it('should throw an error if product not found', async () => {
      mockProductRepository.findOneBy.mockResolvedValue(null);

      await expect(service.update(2, {} as any)).rejects.toThrow(HttpException);
      expect(mockProductRepository.findOneBy).toHaveBeenCalledWith({ id: 2 });
    });
  });

  describe('remove', () => {
    it('should delete a product', async () => {
      mockProductRepository.delete.mockResolvedValue({ affected: 2 });

      const result = await service.remove(2);

      expect(mockProductRepository.delete).toHaveBeenCalledWith({ id: 2 });
      expect(result).toEqual({ message: 'Product deleted successfully' });
    });

    it('should throw an error if product not found', async () => {
      mockProductRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(2)).rejects.toThrow(HttpException);
      expect(mockProductRepository.delete).toHaveBeenCalledWith({ id: 2 });
    });
  });
});
