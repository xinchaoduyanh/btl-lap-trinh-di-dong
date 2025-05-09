import { Module } from '@nestjs/common'
import { MenuItemController } from './menu-item.controller'
import { MenuItemService } from './menu-item.service'
import { PrismaService } from '../prisma/prisma.service'

@Module({
  controllers: [MenuItemController],
  providers: [MenuItemService, PrismaService],
  exports: [MenuItemService],
})
export class MenuModule {}
