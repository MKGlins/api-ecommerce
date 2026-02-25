import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('checkout')
  @UseGuards(JwtAuthGuard)
  createCheckout(
    @Body() createCheckoutDto: CreateCheckoutDto,
    @CurrentUser() user: User,
  ) {
    return this.paymentsService.createCheckout(createCheckoutDto, user.id);
  }

  @Post('webhook')
  async webhook(@Body() body: { type?: string; action?: string; data?: { id?: string } }) {
    const type = body?.type;
    const action = body?.action;
    const dataId = body?.data?.id;

    if (!type || !dataId) {
      return { received: true };
    }

    await this.paymentsService.handleWebhook(type, action || '', dataId);
    return { received: true };
  }
}
