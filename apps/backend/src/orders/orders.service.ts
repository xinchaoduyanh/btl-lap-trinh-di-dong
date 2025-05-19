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

      // Xử lý đặc biệt cho timeOut
      if (order.timeOut) {
        try {
          // Chuyển đổi timeOut thành đối tượng Date
          const timeOutDate = new Date(order.timeOut)
          console.log(`Order ${id} has timeOut: ${timeOutDate}`)
        } catch (timeOutErr) {
          console.error(`Error parsing timeOut for order ${id}:`, timeOutErr)
        }
      }

      // Xóa tất cả các OrderItem liên quan trước
      if (order.orderItems && order.orderItems.length > 0) {
        await this.prisma.orderItem.deleteMany({
          where: {
            orderId: id,
          },
        })
      }

      // Tiếp tục với quá trình xóa đơn hàng
      return await this.prisma.order.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Order with ID ${id} not found`)
        }
        if (error.code === 'P2003') {
          throw new ConflictException(`Cannot delete order ${id} because it has related items. Please delete the order items first.`)
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
