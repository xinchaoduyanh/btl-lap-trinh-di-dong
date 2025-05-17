import { z } from 'zod'
import { FoodCategory } from '@prisma/client'

export const createFoodSchema = z.object({
  name: z.string().min(1),
  price: z.number().positive(),
  category: z.nativeEnum(FoodCategory),
  isAvailable: z.boolean().default(true),
})

export const updateFoodSchema = createFoodSchema.partial()

export type CreateFoodDto = z.infer<typeof createFoodSchema>
export type UpdateFoodDto = z.infer<typeof updateFoodSchema>
