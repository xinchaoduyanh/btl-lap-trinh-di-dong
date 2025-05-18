import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrderDto, UpdateOrderDto } from './order.dto'
import { OrderItemStatus, Prisma, OrderStatus, TableStatus } from '@prisma/client'

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      return await this.prisma.order.create({
        data: createOrderDto,
      })
    } catch (error) {
      throw error
    }
  }

  async findAll() {
    return await this.prisma.order.findMany()
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
    })
    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`)
    }
    return order
  }

  async update(id: string, updateOrderDto: UpdateOrderDto) {
    try {
      return await this.prisma.order.update({
        where: { id },
        data: updateOrderDto,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Order with ID ${id} not found`)
        }
      }
      throw error
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.order.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Order with ID ${id} not found`)
        }
      }
      throw error
    }
  }

  async findPreparingOrders() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.RESERVED,
        table: {
          status: TableStatus.RESERVED,
        },
      },
      include: {
        table: true,
        orderItems: {
          include: {
            food: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    if (!orders || orders.length === 0) {
      throw new NotFoundException('No preparing orders found')
    }

    return orders
  }
}
