import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RegisterDto, LoginDto } from './auth.dto'

@Injectable()
export class AuthService {
  constructor(private prismaService: PrismaService) {}

  async register(dto: RegisterDto) {
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

    // Loại bỏ password trước khi trả về
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
}
