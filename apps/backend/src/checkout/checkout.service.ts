import { Injectable, BadRequestException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CheckInDto, CheckOutDto, GetHistoryDto } from './checkout.dto'
import { WorkSession, DailyWorkRecord } from './Icheckout'

@Injectable()
export class CheckoutService {
  constructor(private prisma: PrismaService) {}

  async checkIn(checkInDto: CheckInDto) {
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
}
