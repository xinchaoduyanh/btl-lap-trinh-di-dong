import { z } from 'zod'
import { OrderItemStatus } from '@prisma/client'

export const createOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  foodId: z.string().uuid(),
  quantity: z.number().int().min(1),
  status: z.nativeEnum(OrderItemStatus).optional(),
})

export const updateOrderItemSchema = createOrderItemSchema.partial()

export type CreateOrderItemDto = z.infer<typeof createOrderItemSchema>
export type UpdateOrderItemDto = z.infer<typeof updateOrderItemSchema>
