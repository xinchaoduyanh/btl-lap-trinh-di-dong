import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthModule } from './auth/auth.module'
import { PrismaModule } from './prisma/prisma.module'
import { ZodValidationPipe } from 'nestjs-zod'
import { APP_PIPE } from '@nestjs/core'
import { CheckoutModule } from './checkout/checkout.module'
import { TableModule } from './table/table.module'
import { MenuModule } from './menu/menu.module'


@Module({
  imports: [AuthModule, PrismaModule, CheckoutModule, TableModule, MenuModule],
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
