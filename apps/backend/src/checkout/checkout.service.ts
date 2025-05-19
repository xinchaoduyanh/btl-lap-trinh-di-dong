import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CheckInDto, CheckOutDto, GetHistoryDto } from './checkout.dto'
import { CreateQRCodeDto, ValidateQRCodeDto } from './qr-code.dto'
import { WorkSession, DailyWorkRecord } from './Icheckout'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  // Tạo mã QR mới (chỉ admin mới có quyền)
  async createQRCode(createQRCodeDto: CreateQRCodeDto) {
    const qrCode = uuidv4() // Tạo mã QR ngẫu nhiên
    const validUntil = new Date(createQRCodeDto.validUntil)

    return this.prisma.qRCode.create({
      data: {
        code: qrCode,
        validUntil,
        location: createQRCodeDto.location,
        isUsed: false, // QR code mới tạo sẽ ở trạng thái active
      },
    })
  }

  // Toggle trạng thái QR code (chỉ admin)
  async toggleQRCodeStatus(qrCodeId: string) {
    const qrCode = await this.prisma.qRCode.findUnique({
      where: { id: qrCodeId },
    })

    if (!qrCode) {
      throw new NotFoundException('Không tìm thấy QR code')
    }

    return this.prisma.qRCode.update({
      where: { id: qrCodeId },
      data: { isUsed: !qrCode.isUsed }, // Đảo ngược trạng thái
    })
  }

  // Validate QR code trước khi check-in
  async validateQRCode(validateQRCodeDto: ValidateQRCodeDto) {
    const qrCode = await this.prisma.qRCode.findFirst({
      where: {
        code: validateQRCodeDto.qrCode,
        isUsed: false, // Chỉ cho phép check-in khi QR code đang active
        validUntil: {
          gt: new Date(), // Chưa hết hạn
        },
      },
    })

    if (!qrCode) {
      throw new BadRequestException('Mã QR không hợp lệ, đã hết hạn hoặc đang bị khóa')
    }

    return true // Trả về true nếu QR code hợp lệ
  }

  // Tự động update trạng thái QR code hết hạn
  async updateExpiredQRCodes() {
    const now = new Date()
    return this.prisma.qRCode.updateMany({
      where: {
        validUntil: {
          lt: now,
        },
        isUsed: false, // Chỉ update những QR code đang active
      },
      data: {
        isUsed: true, // Chuyển sang trạng thái khóa
      },
    })
  }

  async checkIn(checkInDto: CheckInDto) {
    // Validate QR code trước
    const { qrCode: code, employeeId } = checkInDto
    console.log(code);

    const qrCode = await this.prisma.qRCode.findFirst({
      where: {
        code: code, // Check theo code thay vì id
      },
    })
    console.log(qrCode);
    //Kiểm tra xem còn hạn k
    const isQRCodeValid = qrCode?.validUntil && qrCode.validUntil > new Date()
    console.log(isQRCodeValid);
    if (!qrCode) {
      throw new BadRequestException('Mã QR không hợp lệ, đã hết hạn hoặc đang bị khóa')
    }
       // Kiểm tra xem employee có tồn tại không
       const employee = await this.prisma.employee.findUnique({
        where: { id: checkInDto.employeeId },
      })

      if (!employee) {
        throw new BadRequestException('Không tìm thấy nhân viên')
      }

    // Kiểm tra xem nhân viên đã check-in chưa
    const activeCheckout = await this.prisma.checkouts.findFirst({
      where: {
        employeeId: checkInDto.employeeId,
        status: 'CHECKED_IN',
      },
    })

    if (activeCheckout) {
      throw new BadRequestException('Nhân viên đã check-in')
    }


    // Tạo record check-in
    return this.prisma.checkouts.create({
      data: {
        employeeId: checkInDto.employeeId,
        status: 'CHECKED_IN',
      },
      include: {
        employee: true,
      },
    })
  }

  async checkOut(checkOutDto: CheckOutDto) {
    // Tìm record check-in gần nhất của nhân viên
    const checkout = await this.prisma.checkouts.findFirst({
      where: {
        employeeId: checkOutDto.employeeId,
        status: 'CHECKED_IN',
      },
      orderBy: {
        checkIn: 'desc',
      },
    })

    if (!checkout) {
      throw new BadRequestException('Nhân viên chưa check-in')
    }

    return this.prisma.checkouts.update({
      where: { id: checkout.id },
      data: {
        status: 'CHECKED_OUT',
        checkOut: new Date(),
      },
      include: {
        employee: true,
      },
    })
  }

  async getCurrentStatus(employeeId: string) {
    // Tìm phiên làm việc đang CHECKED_IN
    const session = await this.prisma.checkouts.findFirst({
      where: {
        employeeId,
        status: 'CHECKED_IN',
      },
      orderBy: { checkIn: 'desc' },
    })

    if (!session) {
      return {
        status: 'CHECKED_OUT',
        session: null,
        total_time: null,
      }
    }

    const now = new Date()
    const totalSeconds = this.diffSeconds(session.checkIn, now)
    return {
      status: 'CHECKED_IN',
      session: {
        checkIn: session.checkIn,
        // Có thể thêm các trường khác nếu muốn
      },
      total_time: this.formatTotalTime(totalSeconds),
    }
  }

  async getHistory(employeeId: string, filter?: GetHistoryDto) {
    const whereCondition: any = {
      employeeId,
      status: 'CHECKED_OUT',
      checkOut: { not: null },
    }

    if (filter?.date) {
      // Filter theo ngày VN (UTC+7)
      const baseDate = new Date(filter.date + 'T00:00:00.000Z')
      const startDate = new Date(baseDate.getTime() + 7 * 60 * 60 * 1000)
      const endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000)
      whereCondition.checkIn = { gte: startDate, lt: endDate }
    }

    const history = await this.prisma.checkouts.findMany({
      where: whereCondition,
      orderBy: { checkIn: 'desc' },
    })

    if (!filter?.date) {
      // Không truyền ngày: chỉ lấy 5 phiên gần nhất, không cần tổng time
      return history.slice(0, 5).map((session) => ({
        checkIn: session.checkIn,
        checkOut: session.checkOut,
      }))
    } else {
      // Có truyền ngày: trả về toàn bộ và tổng thời gian
      const sessions = history.map((session) => {
        const checkOutTime = session.checkOut ?? new Date()
        return {
          checkIn: session.checkIn,
          checkOut: session.checkOut,
          hoursWorked: this.calculateHoursWorked(session.checkIn!, checkOutTime),
        }
      })
      const totalSeconds = sessions.reduce(
        (sum, s) => sum + this.diffSeconds(s.checkIn, s.checkOut ?? new Date()),
        0
      )
      return {
        sessions,
        totalWorked: this.formatTotalTime(totalSeconds),
      }
    }
  }

  // Helper
  private calculateHoursWorked(checkIn: Date, checkOut: Date): string {
    const totalSeconds = this.diffSeconds(checkIn, checkOut)
    return this.formatTotalTime(totalSeconds)
  }
  private diffSeconds(a: Date, b: Date): number {
    return Math.floor((b.getTime() - a.getTime()) / 1000)
  }
  private formatTotalTime(totalSeconds: number): string {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60) % 60
    const seconds = totalSeconds % 60
    return `${hours}h ${minutes}m ${seconds}s`
  }

  // Lấy danh sách QR code (chỉ admin)
  async getAllQRCodes() {
    return this.prisma.qRCode.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
  }
}
