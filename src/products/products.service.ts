import { Injectable } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { EntityManager, Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProductsService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(Product)
    private repository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const createdProduct = this.repository.create(createProductDto);
    return createdProduct;
  }

  async findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    return this.repository.findOneOrFail({ where: { id } });
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = this.repository.findOneOrFail({ where: { id } });
    const updatedProduct = this.repository.save({
      ...product,
      ...updateProductDto,
    });
    return updatedProduct;
  }

  async remove(id: number) {
    return this.repository.delete({ id });
  }
}
