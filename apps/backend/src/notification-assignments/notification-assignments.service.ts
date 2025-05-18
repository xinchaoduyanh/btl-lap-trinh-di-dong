import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { Prisma } from '@prisma/client'
import {
  CreateNotificationAssignmentDto,
  UpdateNotificationAssignmentDto,
} from './notification-assignment.dto'

@Injectable()
export class NotificationAssignmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationAssignmentDto: CreateNotificationAssignmentDto) {
    try {
      return await this.prisma.notificationAssignment.create({
        data: createNotificationAssignmentDto,
      })
    } catch (error) {
      throw error
    }
  }

  async findAll() {
    return await this.prisma.notificationAssignment.findMany({
      include: {
        notification: {
          select: {
            id: true,
            message: true,
          },
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })
  }

  async findOne(id: string) {
    const notificationAssignment = await this.prisma.notificationAssignment.findUnique({
      where: { id },
      include: {
        notification: {
          select: {
            id: true,
            message: true,
          },
        },
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    })
    if (!notificationAssignment) {
      throw new NotFoundException(`NotificationAssignment with ID ${id} not found`)
    }
    return notificationAssignment
  }

  async findByEmployee(employeeId: string) {
    return await this.prisma.notificationAssignment.findMany({
      where: {
        employeeId,
        isDelete: false, // Chỉ lấy thông báo chưa xóa
      },
      include: {
        notification: true,
      },
      orderBy: {
        notification: {
          createdAt: 'desc',
        },
      },
    })
  }

  async markAsRead(id: string) {
    await this.findOne(id)
    return await this.prisma.notificationAssignment.update({
      where: { id },
      data: { isRead: true },
    })
  }

  async update(id: string, updateNotificationAssignmentDto: any) {
    try {
      // Kiểm tra xem notification assignment có tồn tại không
      const notificationAssignment = await this.prisma.notificationAssignment.findUnique({
        where: { id },
      })

      if (!notificationAssignment) {
        throw new NotFoundException(`NotificationAssignment with ID ${id} not found`)
      }

      // Xử lý dữ liệu cập nhật một cách an toàn
      const updateData: any = {}

      // Chỉ cập nhật isRead nếu nó được cung cấp và khác undefined
      if (updateNotificationAssignmentDto && updateNotificationAssignmentDto.isRead !== undefined) {
        updateData.isRead = updateNotificationAssignmentDto.isRead
      }

      // Chỉ cập nhật isDelete nếu nó được cung cấp và khác undefined
      if (
        updateNotificationAssignmentDto &&
        updateNotificationAssignmentDto.isDelete !== undefined
      ) {
        updateData.isDelete = updateNotificationAssignmentDto.isDelete
      }

      // Nếu không có dữ liệu cập nhật, trả về đối tượng hiện tại
      if (Object.keys(updateData).length === 0) {
        return notificationAssignment
      }

      // Thực hiện cập nhật
      return await this.prisma.notificationAssignment.update({
        where: { id },
        data: updateData,
        include: {
          notification: {
            select: {
              id: true,
              message: true,
            },
          },
          employee: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      })
    } catch (error) {
      throw error
    }
  }

  async remove(id: string) {
    await this.findOne(id)
    return await this.prisma.notificationAssignment.delete({
      where: { id },
    })
  }

  async countUnreadByEmployee(employeeId: string) {
    const count = await this.prisma.notificationAssignment.count({
      where: {
        employeeId,
        isRead: false,
        isDelete: false, // Chỉ đếm thông báo chưa xóa
      },
    })

    return { count }
  }

  async findAllByEmployee(employeeId: string, includeDeleted: boolean = false) {
    const whereCondition: any = { employeeId }

    // Mặc định loại bỏ các thông báo đã xóa
    if (!includeDeleted) {
      whereCondition.isDelete = false
    }

    return await this.prisma.notificationAssignment.findMany({
      where: whereCondition,
      include: {
        notification: {
          select: {
            id: true,
            message: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        notification: {
          createdAt: 'desc',
        },
      },
    })
  }
}
