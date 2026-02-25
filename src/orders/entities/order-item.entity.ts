import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity({ name: 'pedido_itens' })
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Order, (order) => order.itens, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pedido_id' })
  pedido: Order;

  @Column({ name: 'pedido_id' })
  pedidoId: number;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'produto_id' })
  produto: Product;

  @Column({ name: 'produto_id' })
  produtoId: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'preco_unitario' })
  precoUnitario: number;

  @Column('int')
  quantidade: number;
}
