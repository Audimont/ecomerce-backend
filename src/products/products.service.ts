import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly repository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const existingProduct = await this.repository.findOneBy({
      name: createProductDto.name,
    });
    if (existingProduct) {
      throw new HttpException(
        'Product with this name already exists',
        HttpStatus.CONFLICT,
      );
    }

    return await this.repository.save(createProductDto);
  }

  async findAll(): Promise<Product[]> {
    return await this.repository.find();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.repository.findOneBy({ id });
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return product;
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.repository.findOneBy({ id });
    if (!product) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }

    return await this.repository.save({ ...product, ...updateProductDto });
  }

  async remove(id: number): Promise<{ message: string }> {
    const result = await this.repository.delete({ id });
    if (result.affected === 0) {
      throw new HttpException('Product not found', HttpStatus.NOT_FOUND);
    }
    return { message: 'Product deleted successfully' };
  }
}
