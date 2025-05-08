import { Module } from '@nestjs/common'
import { CheckoutService } from './checkout.service'
import { PrismaService } from '../prisma/prisma.service'
import { CheckoutController } from 'apps/backend/src/checkout/checkout.controller'

@Module({
  controllers: [CheckoutController],
  providers: [CheckoutService, PrismaService],
  exports: [CheckoutService],
})
export class CheckoutModule {}
