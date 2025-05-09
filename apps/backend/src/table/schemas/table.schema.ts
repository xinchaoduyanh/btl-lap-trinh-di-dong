import { z } from 'zod'
import { TableStatus } from '../enums/table-status.enum'

export const createTableSchema = z.object({
  number: z.number().int().positive(),
  status: z.nativeEnum(TableStatus),
})

export const updateTableSchema = createTableSchema.partial()

export type CreateTableDto = z.infer<typeof createTableSchema>
export type UpdateTableDto = z.infer<typeof updateTableSchema>
