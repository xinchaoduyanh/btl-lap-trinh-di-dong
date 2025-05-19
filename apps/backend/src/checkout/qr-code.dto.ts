import { z } from 'zod'

// Schema cho tạo QR code
export const CreateQRCodeSchema = z.object({
  validUntil: z.string().datetime(), // Thời gian hết hạn của mã QR
  location: z.string().optional(), // Vị trí check-in (optional)
})

// Schema cho validate QR code
export const ValidateQRCodeSchema = z.object({
  qrCode: z.string(),
  employeeId: z.string().uuid(),
})

// Types
export type CreateQRCodeDto = z.infer<typeof CreateQRCodeSchema>
export type ValidateQRCodeDto = z.infer<typeof ValidateQRCodeSchema>
