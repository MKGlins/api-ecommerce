import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  private preference: Preference | null = null;
  private payment: Payment | null = null;

  constructor(
    private configService: ConfigService,
    private ordersService: OrdersService,
  ) {
    const accessToken = this.configService.get<string>('MERCADO_PAGO_ACCESS_TOKEN');
    if (accessToken) {
      const client = new MercadoPagoConfig({
        accessToken,
        options: { timeout: 5000 },
      });
      this.preference = new Preference(client);
      this.payment = new Payment(client);
    }
  }

  async createCheckout(dto: CreateCheckoutDto, compradorId: number) {
    if (!this.preference) {
      throw new BadRequestException(
        'Mercado Pago não configurado. Defina MERCADO_PAGO_ACCESS_TOKEN no .env',
      );
    }

    const pedido = await this.ordersService.create({
      compradorId,
      itens: dto.itens.map((i) => ({
        produtoId: i.produtoId,
        titulo: i.titulo,
        preco: i.preco,
        quantidade: i.quantidade,
      })),
    });

    const items = dto.itens.map((item) => ({
      title: item.titulo,
      unit_price: item.preco,
      quantity: item.quantidade,
    }));

    const body: any = {
      items,
      auto_return: 'approved' as const,
      external_reference: String(pedido.id),
    };

    if (dto.successUrl || dto.failureUrl || dto.pendingUrl) {
      body.back_urls = {
        success: dto.successUrl || undefined,
        failure: dto.failureUrl || undefined,
        pending: dto.pendingUrl || undefined,
      };
    }

    try {
      const response = await this.preference!.create({ body });
      await this.ordersService.updatePreferenceId(pedido.id, response.id!);
      return {
        orderId: pedido.id,
        preferenceId: response.id,
        init_point: response.init_point,
        sandbox_init_point: response.sandbox_init_point,
      };
    } catch (error: any) {
      throw new BadRequestException(
        error?.message || 'Erro ao criar link de checkout',
      );
    }
  }

  async handleWebhook(type: string, action: string, dataId: string): Promise<void> {
    if (type !== 'payment' || !this.payment) return;

    try {
      const paymentData = await this.payment.get({ id: dataId });
      const externalRef = paymentData?.external_reference;
      const status = paymentData?.status;

      if (!externalRef || typeof externalRef !== 'string') return;

      const pedido = await this.ordersService.findByExternalReference(externalRef);
      if (!pedido) return;

      if (status === 'approved') {
        await this.ordersService.handlePaymentApproved(pedido.id, String(dataId));
      } else if (status === 'rejected') {
        await this.ordersService.handlePaymentRejected(pedido.id);
      }
    } catch {
      // Silently ignore webhook processing errors; MP may retry
    }
  }
}
