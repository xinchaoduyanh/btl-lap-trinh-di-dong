import { z } from 'zod'
import { Role } from '@prisma/client'

// Base schema for employee
const employeeBaseSchema = z.object({
  email: z.string().email('Invalid email format'),
  name: z.string().min(1, 'Name is required'),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
  isActive: z.boolean().optional().default(true),
})

// Schema for creating an employee (all fields required)
export const createEmployeeSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
  role: z.nativeEnum(Role, {
    errorMap: () => ({ message: 'Invalid role' }),
  }),
  isActive: z.boolean().default(true),
})

// Schema for updating an employee (all fields optional)
export const updateEmployeeSchema = z.object({
  email: z.string().email('Invalid email format').optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  name: z.string().min(1, 'Name is required').optional(),
  role: z
    .nativeEnum(Role, {
      errorMap: () => ({ message: 'Invalid role' }),
    })
    .optional(),
  isActive: z.boolean().optional(),
})

// Types
export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>
