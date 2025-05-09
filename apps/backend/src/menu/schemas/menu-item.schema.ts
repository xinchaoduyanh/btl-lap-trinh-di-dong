import { z } from 'zod'

export const createMenuItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be positive'),
  isAvailable: z.boolean().default(true),
})

export const updateMenuItemSchema = createMenuItemSchema.partial()

export type CreateMenuItemDto = z.infer<typeof createMenuItemSchema>
export type UpdateMenuItemDto = z.infer<typeof updateMenuItemSchema>
