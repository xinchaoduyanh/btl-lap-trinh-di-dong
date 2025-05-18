import { z } from 'zod'
import { OrderStatus } from '@prisma/client'
export const createOrderSchema = z.object({
  tableId: z.string().uuid(),
  employeeId: z.string().uuid(),
  status: z.nativeEnum(OrderStatus),
  timeOut: z.string().datetime().optional().nullable(),
})

export const updateOrderSchema = createOrderSchema.partial()

export type CreateOrderDto = z.infer<typeof createOrderSchema>
export type UpdateOrderDto = z.infer<typeof updateOrderSchema>
