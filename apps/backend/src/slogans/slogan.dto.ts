import { z } from 'zod'

export const createSloganSchema = z.object({
  content: z.string().min(1),
})

export const updateSloganSchema = createSloganSchema.partial()

export type CreateSloganDto = z.infer<typeof createSloganSchema>
export type UpdateSloganDto = z.infer<typeof updateSloganSchema>