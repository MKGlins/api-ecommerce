import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ProductsService } from '../products/products.service';

export interface CreateOrderInput {
  compradorId: number;
  itens: { produtoId: number; titulo: string; preco: number; quantidade: number }[];
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepo: Repository<OrderItem>,
    private productsService: ProductsService,
  ) {}

  async create(input: CreateOrderInput): Promise<Order> {
    let valorTotal = 0;
    const itens: Partial<OrderItem>[] = [];

    for (const item of input.itens) {
      const produto = await this.productsService.findOne(item.produtoId);
      if (!produto) {
        throw new BadRequestException(`Produto ${item.produtoId} não encontrado`);
      }
      const estoqueAtual = Number(produto.estoque);
      if (estoqueAtual < item.quantidade) {
        throw new BadRequestException(
          `Estoque insuficiente para o produto "${item.titulo}". Disponível: ${estoqueAtual}`,
        );
      }
      const subtotal = item.preco * item.quantidade;
      valorTotal += subtotal;
      itens.push({
        produtoId: item.produtoId,
        precoUnitario: item.preco,
        quantidade: item.quantidade,
      });
    }

    const pedido = this.orderRepo.create({
      compradorId: input.compradorId,
      valorTotal,
      status: OrderStatus.PENDENTE,
    });
    const savedOrder = await this.orderRepo.save(pedido);

    for (const item of itens) {
      const orderItem = this.orderItemRepo.create({
        ...item,
        pedidoId: savedOrder.id,
      });
      await this.orderItemRepo.save(orderItem);
    }

    return this.findOne(savedOrder.id);
  }

  async findOne(id: number): Promise<Order> {
    const pedido = await this.orderRepo.findOne({
      where: { id },
      relations: ['itens', 'itens.produto', 'comprador'],
    });
    if (!pedido) {
      throw new NotFoundException('Pedido não encontrado');
    }
    return pedido;
  }

  async findByComprador(compradorId: number): Promise<Order[]> {
    return this.orderRepo.find({
      where: { compradorId },
      relations: ['itens', 'itens.produto'],
      order: { createdAt: 'DESC' },
    });
  }

  async updatePreferenceId(orderId: number, preferenceId: string): Promise<void> {
    await this.orderRepo.update(orderId, {
      mercadoPagoPreferenceId: preferenceId,
    });
  }

  async findByExternalReference(externalRef: string): Promise<Order | null> {
    const orderId = parseInt(externalRef, 10);
    if (isNaN(orderId)) return null;
    return this.orderRepo.findOne({
      where: { id: orderId },
      relations: ['itens'],
    });
  }

  async handlePaymentApproved(orderId: number, paymentId: string): Promise<void> {
    const pedido = await this.findOne(orderId);
    if (pedido.status === OrderStatus.APROVADO) {
      return;
    }

    await this.orderRepo.update(orderId, {
      status: OrderStatus.APROVADO,
      mercadoPagoPaymentId: paymentId,
    });

    for (const item of pedido.itens) {
      await this.productsService.decrementStock(
        item.produtoId,
        item.quantidade,
      );
    }
  }

  async handlePaymentRejected(orderId: number): Promise<void> {
    const pedido = await this.findOne(orderId);
    if (pedido.status !== OrderStatus.PENDENTE) {
      return;
    }
    await this.orderRepo.update(orderId, { status: OrderStatus.REJEITADO });
  }
}
