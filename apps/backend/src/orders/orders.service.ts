import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateOrderDto, UpdateOrderDto } from './order.dto'
import { OrderItemStatus, Prisma, OrderStatus, TableStatus } from '@prisma/client'

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(createOrderDto: CreateOrderDto) {
    try {
      return await this.prisma.$transaction(async (prisma) => {
        const newOrder = await prisma.order.create({
          data: {
            tableId: createOrderDto.tableId,
            employeeId: createOrderDto.employeeId,
            orderItems: {
              create:
                createOrderDto.orderItems?.map((item) => ({
                  foodId: item.foodId,
                  quantity: item.quantity,
                  status: 'PENDING',
                })) || [],
            },
          },
          include: {
            orderItems: {
              include: {
                food: true,
              },
            },
            table: true,
            employee: true,
          },
        })

        return newOrder
      })
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    }
  }

  async findAll() {
    // THêm điều kiện để log ra đc cả thông tin employee
    const a = await this.prisma.order.findMany({
      include: {
        employee: true,
        table: true,
      },
    })
    console.log(a)
    return a
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
      const { orderItems, ...orderData } = updateOrderDto
      return await this.prisma.order.update({
        where: { id },
        data: orderData,
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
    try {
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

      console.log(`Found ${orders.length} preparing orders`)

      // Trả về mảng rỗng thay vì throw error nếu không có đơn hàng
      return orders
    } catch (error) {
      console.error('Error fetching preparing orders:', error)
      throw error
    }
  }
}
