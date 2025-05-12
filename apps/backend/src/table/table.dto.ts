import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

// Table status enum
export enum TableStatus {
  ALL = 'ALL',
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING',
}

// Create table schema
const CreateTableSchema = z.object({
  number: z.number().int().min(1, 'Table number is required'),
  name: z.string().min(1, 'Table name is required'),
  capacity: z.number().int().min(1, 'Capacity must be at least 1'),
  status: z.nativeEnum(TableStatus).default(TableStatus.AVAILABLE),
  location: z.string().optional(),
  description: z.string().optional(),
})

// Update table schema
const UpdateTableSchema = CreateTableSchema.partial()

// Create DTOs from schemas
export class CreateTableDto extends createZodDto(CreateTableSchema) {}
export class UpdateTableDto extends createZodDto(UpdateTableSchema) {}
