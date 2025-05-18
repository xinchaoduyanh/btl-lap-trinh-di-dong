import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateNotificationAssignmentDto, UpdateNotificationAssignmentDto } from './notification-assignment.dto'

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
        notification: true,
        employee: true,
      },
    })
  }

  async findOne(id: string) {
    const notificationAssignment = await this.prisma.notificationAssignment.findUnique({
      where: { id },
      include: {
        notification: true,
        employee: true,
      },
    })
    if (!notificationAssignment) {
      throw new NotFoundException(`NotificationAssignment with ID ${id} not found`)
    }
    return notificationAssignment
  }

  async findByEmployee(employeeId: string) {
    return await this.prisma.notificationAssignment.findMany({
      where: { employeeId },
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

  async update(id: string, updateNotificationAssignmentDto: UpdateNotificationAssignmentDto) {
    await this.findOne(id)
    return await this.prisma.notificationAssignment.update({
      where: { id },
      data: updateNotificationAssignmentDto,
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return await this.prisma.notificationAssignment.delete({
      where: { id },
    })
  }
}