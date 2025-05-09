import { z } from 'zod'

export const createOrderItemSchema = z.object({
  orderId: z.string().uuid(),
  menuItemId: z.string().uuid(),
  quantity: z.number().int().positive(),
  unitPrice: z.number().positive(),
})

export const updateOrderItemSchema = createOrderItemSchema.partial()

export type CreateOrderItemDto = z.infer<typeof createOrderItemSchema>
export type UpdateOrderItemDto = z.infer<typeof updateOrderItemSchema>
