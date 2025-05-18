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
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.ordersService.remove(id)
  }
}
