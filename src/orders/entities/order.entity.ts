import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';

import { OrderItem } from './order-item.entity';
import { User } from '@users/entities/user.entity';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.orders)
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order, { cascade: true })
  items: OrderItem[];

  @Column({ type: 'decimal' })
  totalPrice: number;

  @Column({ type: 'varchar', length: 50, default: 'pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
