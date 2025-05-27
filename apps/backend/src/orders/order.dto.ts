import { z } from 'zod'
import { OrderStatus } from '@prisma/client'

// Tạo schema xử lý timeOut linh hoạt hơn
const timeOutSchema = z.union([
  z.string().datetime(),
  z.string().refine(
    (val) => {
      try {
        // Kiểm tra xem có thể chuyển đổi thành Date hợp lệ không
        const date = new Date(val)
        return !isNaN(date.getTime())
      } catch {
        return false
      }
    },
    {
      message: 'Invalid date format for timeOut',
    }
  ),
  z.null(),
  z.undefined(),
])

export const createOrderSchema = z.object({
  tableId: z.string().uuid(),
  employeeId: z.string().uuid(),
  status: z.nativeEnum(OrderStatus),
  timeOut: timeOutSchema.optional(),
  orderItems: z
    .array(
      z.object({
        foodId: z.string().uuid(),
        quantity: z.number().int().positive(),
      })
    )
    .optional(),
})

export const updateOrderSchema = createOrderSchema.partial()

export type CreateOrderDto = z.infer<typeof createOrderSchema>
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>

export class SimpleOrderDto {
  id: string = ''
  totalAmount: number = 0
  status: string = ''
  tableId: string = ''
  employeeId: string = ''
  createdAt: Date = new Date()
}

export class RevenueStatsDto {
  date: Date = new Date()
  totalAmount: number = 0
  orderCount: number = 0
}

export class RevenueResponseDto {
  data: RevenueStatsDto[] = []
  totalRevenue: number = 0
}

export class DailySalesDto {
  date: Date = new Date()
  totalAmount: number = 0
}

export class TopSellingItemDto {
  foodId: string = ''
  foodName: string = ''
  quantity: number = 0
  revenue: number = 0
}

export class TableOccupancyDto {
  status: string = ''
  count: number = 0
}

export class EmployeePerformanceDto {
  employeeId: string = ''
  employeeName: string = ''
  ordersHandled: number = 0
  totalRevenue: number = 0
}

export class CategoryRevenueDto {
  categoryId: string = ''
  categoryName: string = ''
  revenue: number = 0
}

export class AnalyticsResponseDto {
  dailySales: DailySalesDto[] = []
  topSellingItems: TopSellingItemDto[] = []
  tableOccupancy: TableOccupancyDto[] = []
  employeePerformance: EmployeePerformanceDto[] = []
  revenueByCategory: CategoryRevenueDto[] = []
}
