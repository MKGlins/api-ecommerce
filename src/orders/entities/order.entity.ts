import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDENTE = 'PENDENTE',
  APROVADO = 'APROVADO',
  REJEITADO = 'REJEITADO',
}

@Entity({ name: 'pedidos' })
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'comprador_id' })
  comprador: User;

  @Column({ name: 'comprador_id' })
  compradorId: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'valor_total' })
  valorTotal: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDENTE,
  })
  status: OrderStatus;

  @Column({ name: 'mercado_pago_preference_id', nullable: true })
  mercadoPagoPreferenceId: string | null;

  @Column({ name: 'mercado_pago_payment_id', nullable: true })
  mercadoPagoPaymentId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, (item) => item.pedido, { cascade: true })
  itens: OrderItem[];
}
