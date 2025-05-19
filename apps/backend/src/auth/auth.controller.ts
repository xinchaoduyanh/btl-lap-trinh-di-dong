// apps/backend/src/auth/auth.controller.ts
import { Controller, Post, Body } from '@nestjs/common'
import { AuthService } from './auth.service'
import { RegisterDto, LoginDto } from './auth.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: { email: string; code: string; name: string; password: string }) {
    return this.authService.register(dto)
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto)
  }

  @Post('send-otp')
  async sendOtp(@Body('email') email: string) {
    return this.authService.createOtp(email)
  }

  @Post('verify-otp')
  async verifyOtp(@Body() body: { email: string; code: string }) {
    return this.authService.verifyOtp(body.email, body.code)
  }
}
