import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrderItemDto, UpdateOrderItemDto } from './order-item.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class OrderItemsService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderItemDto: CreateOrderItemDto) {
    try {
      return await this.prisma.orderItem.create({
        data: createOrderItemDto,
      })
    } catch (error) {
      throw error
    }
  }

  async findAll() {
    return await this.prisma.orderItem.findMany()
  }

  async findOne(id: string) {
    const orderItem = await this.prisma.orderItem.findUnique({
      where: { id },
    })
    if (!orderItem) {
      throw new NotFoundException(`OrderItem with ID ${id} not found`)
    }
    return orderItem
  }

  async update(id: string, updateOrderItemDto: UpdateOrderItemDto) {
    try {
      return await this.prisma.orderItem.update({
        where: { id },
        data: updateOrderItemDto,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`OrderItem with ID ${id} not found`)
        }
      }
      throw error
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.orderItem.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`OrderItem with ID ${id} not found`)
        }
      }
      throw error
    }
  }
}
