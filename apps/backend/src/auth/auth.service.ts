import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto, LoginDto } from './auth.dto'
import { EmailService } from 'apps/backend/src/email/email.service'
import { addMinutes, isAfter } from 'date-fns'

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private emailService: EmailService
  ) {}

  async register(dto: { email: string; code: string; name: string; password: string }) {
    // Kiểm tra OTP
    const otp = await this.prismaService.otp.findFirst({
      where: { email: dto.email, code: dto.code, isActive: true },
    })
    if (!otp || isAfter(new Date(), otp.expiresAt)) {
      throw new BadRequestException('OTP invalid or expired')
    }
    // Vô hiệu hóa OTP
    await this.prismaService.otp.update({ where: { id: otp.id }, data: { isActive: false } })

    // Kiểm tra email đã tồn tại chưa
    const existing = await this.prismaService.employee.findUnique({
      where: { email: dto.email },
    })
    if (existing) {
      throw new BadRequestException('Email đã tồn tại')
    }

    // Tạo user mới
    const user = await this.prismaService.employee.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: dto.password,
        role: 'WAITER',
      },
    })
    const { password, ...result } = user
    return result
  }

  async login(dto: LoginDto) {
    // Tìm user theo email
    const user = await this.prismaService.employee.findUnique({
      where: { email: dto.email },
    })

    // Kiểm tra user và password
    if (!user || user.password !== dto.password) {
      throw new BadRequestException('Email hoặc mật khẩu không đúng')
    }

    // Loại bỏ password trước khi trả về
    const { password, ...result } = user
    return result
  }

  async createOtp(email: string) {
    // Kiểm tra email đã tồn tại chưa
    const existing = await this.prismaService.employee.findUnique({
      where: { email },
    })
    if (existing) throw new BadRequestException('Email đã tồn tại')

    // Vô hiệu hóa OTP cũ
    await this.prismaService.otp.updateMany({
      where: { email, isActive: true },
      data: { isActive: false },
    })

    // Tạo OTP mới
    const code = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = addMinutes(new Date(), 5)

    await this.prismaService.otp.create({
      data: { email, code, expiresAt, isActive: true },
    })

    await this.emailService.sendOtpEmail(email, code)
    return { message: 'OTP sent' }
  }

  async verifyOtp(email: string, code: string) {
    const otp = await this.prismaService.otp.findFirst({
      where: { email, code, isActive: true },
    })

    if (!otp) {
      throw new BadRequestException('OTP not found or inactive')
    }
    if (isAfter(new Date(), otp.expiresAt)) {
      await this.prismaService.otp.update({ where: { id: otp.id }, data: { isActive: false } })
      throw new BadRequestException('OTP expired')
    }

    // Vô hiệu hóa OTP sau khi xác thực thành công
    await this.prismaService.otp.update({ where: { id: otp.id }, data: { isActive: false } })
    // VO HIEU TOAN BO OTP cua EMail nay neu thanh cong
    await this.prismaService.otp.updateMany({
      where: { email, isActive: true },
      data: { isActive: false },
    })
    return { valid: true, message: 'OTP verified' }
  }
}
