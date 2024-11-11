import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(User)
    private repository: Repository<User>
  ) { }

  async create(createUserDto: CreateUserDto) {
    const createdUser = await this.repository.save(createUserDto);
    return createdUser;
  }

  async findAll() {
    return this.repository.find();
  }

  async findOne(id: number) {
    return this.repository.findOneBy({ id })
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.repository.findOneByOrFail({ id });
    const updatedUser = await this.repository.save({ ...user, ...updateUserDto });
    return updatedUser;
  }

  async remove(id: number) {
    return this.repository.delete({ id });
  }
}
