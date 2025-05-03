import { z } from 'zod'
import { createZodDto } from 'nestjs-zod'

// Define Zod schema
const LoginSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
})

const RegisterSchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  name: z.string().min(1, 'Name is required'),
})

// Create DTOs from schemas
export class LoginDto extends createZodDto(LoginSchema) {}
export class RegisterDto extends createZodDto(RegisterSchema) {}
