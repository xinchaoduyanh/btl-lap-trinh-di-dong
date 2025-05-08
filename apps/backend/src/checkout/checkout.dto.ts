import { z } from 'zod'

// Schema cho CheckIn
export const CheckInSchema = z.object({
  employeeId: z.string().uuid(),
})

// Schema cho CheckOut
export const CheckOutSchema = z.object({
  employeeId: z.string().uuid(),
})

// Schema cho GetHistory
export const GetHistorySchema = z.object({
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
})

// Types
export type CheckInDto = z.infer<typeof CheckInSchema>
export type CheckOutDto = z.infer<typeof CheckOutSchema>
export type GetHistoryDto = z.infer<typeof GetHistorySchema>
