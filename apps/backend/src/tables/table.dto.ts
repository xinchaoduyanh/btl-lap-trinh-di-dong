import { z } from 'zod'

export const createTableSchema = z.object({
  number: z.number().int().min(1),
})

export const updateTableSchema = createTableSchema.partial()

export type CreateTableDto = z.infer<typeof createTableSchema>
export type UpdateTableDto = z.infer<typeof updateTableSchema>
