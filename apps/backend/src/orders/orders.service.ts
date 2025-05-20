import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrderDto, UpdateOrderDto } from './order.dto'
import { OrderItemStatus, Prisma, OrderStatus, TableStatus } from '@prisma/client'

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      // Sử dụng transaction để đảm bảo tính nhất quán
      return await this.prisma.$transaction(async (prisma) => {
        // Tạo đơn hàng mới
        const newOrder = await prisma.order.create({
          data: createOrderDto,
        })

        // Cập nhật trạng thái bàn thành OCCUPIED
        if (createOrderDto.tableId) {
          await prisma.table.update({
            where: { id: createOrderDto.tableId },
            data: { status: TableStatus.OCCUPIED },
          })
        }

        return newOrder
      })
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  async findAll() {
    return await this.prisma.order.findMany()
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        table: true,
        orderItems: {
          include: {
            food: true,
          },
        },
      },
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
      // Trước khi xóa, kiểm tra order có tồn tại không
      const order = await this.prisma.order.findUnique({
        where: { id },
        include: {
          orderItems: true,
        },
      })

      if (!order) {
        throw new NotFoundException(`Order with ID ${id} not found`)
      }

      // Sử dụng transaction để đảm bảo tính nhất quán
      return await this.prisma.$transaction(async (prisma) => {
        // Xóa tất cả các OrderItem liên quan trước
        await prisma.orderItem.deleteMany({
          where: {
            orderId: id,
          },
        })

        // Xóa đơn hàng
        const deletedOrder = await prisma.order.delete({
          where: { id },
        })

        // Cập nhật trạng thái bàn thành CLEANING nếu có tableId
        if (order.tableId) {
          await prisma.table.update({
            where: { id: order.tableId },
            data: { status: TableStatus.CLEANING },
          })
        }

        return deletedOrder
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Order with ID ${id} not found`)
        }
        if (error.code === 'P2003') {
          throw new ConflictException(
            `Cannot delete order ${id} because it has related items. Please delete the order items first.`
          )
        }
      }
      console.error(`Error removing order ${id}:`, error)
      throw error
    }
  }

  async findPreparingOrders() {
    const orders = await this.prisma.order.findMany({
      where: {
        status: OrderStatus.RESERVED,
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
