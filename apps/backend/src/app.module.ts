import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { ZodValidationPipe } from 'nestjs-zod'
import { APP_PIPE } from '@nestjs/core'
import { CheckoutModule } from './checkout/checkout.module'
import { TablesModule } from './tables/tables.module'
import { FoodsModule } from './foods/foods.module'
import { OrdersModule } from './orders/orders.module'
import { OrderItemsModule } from './order-items/order-items.module'
import { EmployeesModule } from './employees/employees.module'
import { NotificationsModule } from './notifications/notifications.module'
import { SlogansModule } from './slogans/slogans.module'
import { NotificationAssignmentsModule } from './notification-assignments/notification-assignments.module'

@Module({
  imports: [
    AuthModule,
    PrismaModule,
    CheckoutModule,
    TablesModule,
    FoodsModule,
    OrdersModule,
    OrderItemsModule,
    EmployeesModule,
    NotificationsModule,
    SlogansModule,
    NotificationAssignmentsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_PIPE,
      useClass: ZodValidationPipe,
    },
  ],
})
export class AppModule {}
