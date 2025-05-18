import { z } from 'zod'

export const createNotificationAssignmentSchema = z.object({
  notificationId: z.string().uuid(),
  employeeId: z.string().uuid(),
  isRead: z.boolean().optional().default(false),
  isDelete: z.boolean().optional().default(false),
})

export const updateNotificationAssignmentSchema = createNotificationAssignmentSchema.partial()

export type CreateNotificationAssignmentDto = z.infer<typeof createNotificationAssignmentSchema>
export type UpdateNotificationAssignmentDto = z.infer<typeof updateNotificationAssignmentSchema>