import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
  CreateOrderDto,
  UpdateOrderDto,
  RevenueResponseDto,
  RevenueStatsDto,
  AnalyticsResponseDto,
  DailySalesDto,
  TopSellingItemDto,
  TableOccupancyDto,
  EmployeePerformanceDto,
  CategoryRevenueDto,
} from './order.dto'
import { OrderItemStatus, Prisma, OrderStatus, TableStatus, FoodCategory } from '@prisma/client'

type OrderWithDetails = Prisma.OrderGetPayload<{
  include: {
    orderItems: {
      include: {
        food: true
      }
    }
    employee: true
  }
}>

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

      // Trả về mảng rỗng thay vì throw error nếu không có đơn hàng
      return orders
    } catch (error) {
      console.error('Error fetching preparing orders:', error)
      throw error
    }
  }

  async getRevenueStats(days: number): Promise<RevenueResponseDto> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const orders = await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        orderItems: {
          some: {
            status: OrderItemStatus.COMPLETE,
          },
        },
      },
      include: {
        orderItems: {
          where: {
            status: OrderItemStatus.COMPLETE,
          },
          include: {
            food: true,
          },
        },
      },
    })

    // Group orders by date and calculate daily revenue, order count, and order list
    const dailyRevenue = new Map<
      string,
      { totalAmount: number; orderCount: number; orders: any[] }
    >()
    let totalRevenue = 0

    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0]
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + item.food.price * item.quantity
      }, 0)
      const simpleOrder = {
        id: order.id,
        totalAmount: orderTotal,
        status: order.status,
        tableId: order.tableId,
        employeeId: order.employeeId,
        createdAt: order.createdAt,
      }
      const prev = dailyRevenue.get(date) || { totalAmount: 0, orderCount: 0, orders: [] }
      dailyRevenue.set(date, {
        totalAmount: prev.totalAmount + orderTotal,
        orderCount: prev.orderCount + 1,
        orders: [...prev.orders, simpleOrder],
      })
      totalRevenue += orderTotal
    })

    // Tạo mảng các ngày liên tiếp
    const daysArray: Date[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(endDate)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      daysArray.push(d)
    }

    const revenueStats: RevenueStatsDto[] = daysArray.map((dateObj) => {
      const dateStr = dateObj.toISOString().split('T')[0]
      const data = dailyRevenue.get(dateStr)
      return {
        date: dateObj,
        totalAmount: data ? data.totalAmount : 0,
        orderCount: data ? data.orderCount : 0,
      }
    })

    return {
      data: revenueStats,
      totalRevenue,
    }
  }

  async getAnalytics(): Promise<AnalyticsResponseDto> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // Get last 30 days data

    const orders = (await this.prisma.order.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        orderItems: {
          some: {
            status: OrderItemStatus.COMPLETE,
          },
        },
      },
      include: {
        orderItems: {
          where: {
            status: OrderItemStatus.COMPLETE,
          },
          include: {
            food: true,
          },
        },
        employee: true,
      },
    })) as OrderWithDetails[]

    // Calculate daily sales
    const dailySalesMap = new Map<string, number>()
    orders.forEach((order) => {
      const date = order.createdAt.toISOString().split('T')[0]
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + item.food.price * item.quantity
      }, 0)
      dailySalesMap.set(date, (dailySalesMap.get(date) || 0) + orderTotal)
    })

    const dailySales: DailySalesDto[] = Array.from(dailySalesMap.entries())
      .map(([date, amount]) => ({
        date: new Date(date),
        totalAmount: amount,
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    // Calculate top selling items
    const itemSales = new Map<string, { quantity: number; revenue: number; name: string }>()
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const key = item.foodId
        const current = itemSales.get(key) || { quantity: 0, revenue: 0, name: item.food.name }
        itemSales.set(key, {
          quantity: current.quantity + item.quantity,
          revenue: current.revenue + item.food.price * item.quantity,
          name: current.name,
        })
      })
    })

    const topSellingItems: TopSellingItemDto[] = Array.from(itemSales.entries())
      .map(([foodId, data]) => ({
        foodId,
        foodName: data.name,
        quantity: data.quantity,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10)

    // Get table occupancy
    const tables = await this.prisma.table.findMany()
    const tableOccupancy: TableOccupancyDto[] = [
      {
        status: 'AVAILABLE',
        count: tables.filter((t) => t.status === TableStatus.AVAILABLE).length,
      },
      { status: 'OCCUPIED', count: tables.filter((t) => t.status === TableStatus.OCCUPIED).length },
      { status: 'CLEANING', count: tables.filter((t) => t.status === TableStatus.CLEANING).length },
    ]

    // Calculate employee performance
    const employeePerformanceMap = new Map<
      string,
      { ordersHandled: number; totalRevenue: number; name: string }
    >()
    orders.forEach((order) => {
      const key = order.employeeId
      const current = employeePerformanceMap.get(key) || {
        ordersHandled: 0,
        totalRevenue: 0,
        name: order.employee.name,
      }
      const orderTotal = order.orderItems.reduce((sum, item) => {
        return sum + item.food.price * item.quantity
      }, 0)
      employeePerformanceMap.set(key, {
        ordersHandled: current.ordersHandled + 1,
        totalRevenue: current.totalRevenue + orderTotal,
        name: current.name,
      })
    })

    const employeePerformance: EmployeePerformanceDto[] = Array.from(
      employeePerformanceMap.entries()
    )
      .map(([employeeId, data]) => ({
        employeeId,
        employeeName: data.name,
        ordersHandled: data.ordersHandled,
        totalRevenue: data.totalRevenue,
      }))
      .sort((a, b) => b.totalRevenue - a.totalRevenue)

    // Calculate revenue by category
    const categoryRevenueMap = new Map<FoodCategory, { revenue: number; name: string }>()
    orders.forEach((order) => {
      order.orderItems.forEach((item) => {
        const category = item.food.category
        const current = categoryRevenueMap.get(category) || { revenue: 0, name: category }
        categoryRevenueMap.set(category, {
          revenue: current.revenue + item.food.price * item.quantity,
          name: current.name,
        })
      })
    })

    const revenueByCategory: CategoryRevenueDto[] = Array.from(categoryRevenueMap.entries())
      .map(([categoryId, data]) => ({
        categoryId: categoryId,
        categoryName: data.name,
        revenue: data.revenue,
      }))
      .sort((a, b) => b.revenue - a.revenue)

    return {
      dailySales,
      topSellingItems,
      tableOccupancy,
      employeePerformance,
      revenueByCategory,
    }
  }
}
