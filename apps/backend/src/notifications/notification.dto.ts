import { z } from 'zod'

export const createNotificationSchema = z.object({
  message: z.string().min(1),
  employeeId: z.string().uuid(),
})

export const updateNotificationSchema = createNotificationSchema.partial()

export type CreateNotificationDto = z.infer<typeof createNotificationSchema>
export type UpdateNotificationDto = z.infer<typeof updateNotificationSchema>