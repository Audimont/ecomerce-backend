import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Order } from './order.entity';
import { Product } from '@products/entities/product.entity';
import { InstallationSlot } from './installation-slot.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  order: Order;

  @ManyToOne(() => Product)
  product: Product;

  @Column()
  quantity: number;

  @Column({ type: 'decimal' })
  unitPrice: number;

  @Column({ type: 'decimal' })
  totalPrice: number;

  @Column({ default: false })
  installationRequested: boolean;

  @Column({ nullable: true })
  installationDate: Date;

  @ManyToOne(
    () => InstallationSlot,
    (installationSlot) => installationSlot.orderItem,
    { nullable: true },
  )
  installationSlot: InstallationSlot | null;
}
