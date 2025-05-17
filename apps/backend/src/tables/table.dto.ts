import { z } from 'zod'
import { TableStatus } from '@prisma/client'
export const createTableSchema = z.object({
  number: z.number().int().min(1),
  status: z.nativeEnum(TableStatus),
})

export const updateTableSchema = createTableSchema.partial()

export type CreateTableDto = z.infer<typeof createTableSchema>
export type UpdateTableDto = z.infer<typeof updateTableSchema>
