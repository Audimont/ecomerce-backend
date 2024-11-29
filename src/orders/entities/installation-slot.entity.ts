import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { InstallationSlotStatus } from '@common/enums/installation-slot-status.enum';

@Entity('installation_slots')
export class InstallationSlot {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  slotDateTime: Date;

  @Column({ default: InstallationSlotStatus.AVAILABLE })
  status: string;

  @ManyToOne(() => OrderItem, (orderItem) => orderItem.installationSlot, {
    nullable: true,
  })
  orderItem: OrderItem | null;
}
