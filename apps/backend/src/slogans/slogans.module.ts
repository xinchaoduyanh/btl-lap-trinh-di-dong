import { Module } from '@nestjs/common'
import { SlogansService } from './slogans.service'
import { SlogansController } from './slogans.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [SlogansController],
  providers: [SlogansService],
  exports: [SlogansService],
})
export class SlogansModule {}