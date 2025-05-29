import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common'
import { OrdersService } from './orders.service'
import { CreateOrderDto, UpdateOrderDto } from './order.dto'

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(createOrderDto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.ordersService.findAll()
  }

  @Get('preparing')
  @HttpCode(HttpStatus.OK)
  findPreparingOrders() {
    return this.ordersService.findPreparingOrders()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.ordersService.update(id, updateOrderDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK) // Thay đổi từ NO_CONTENT sang OK để có thể trả về thông tin
  async remove(@Param('id') id: string) {
    return this.ordersService.remove(id)
  }

  @Get('revenue/:days')
  async getRevenueStats(@Param('days') days: string) {
    const daysNum = parseInt(days)
    if (isNaN(daysNum) || daysNum < 0) {
      throw new BadRequestException('Invalid days parameter')
    }
    return this.ordersService.getRevenueStats(daysNum)
  }

  @Get('analytics')
  @HttpCode(HttpStatus.OK)
  async getAnalytics() {
    return this.ordersService.getAnalytics()
  }
}
