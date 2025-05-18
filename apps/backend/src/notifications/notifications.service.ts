import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateNotificationDto, UpdateNotificationDto } from './notification.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async create(createNotificationDto: CreateNotificationDto) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          message: createNotificationDto.message,
          NotificationAssignments: {
            create: {
              employeeId: createNotificationDto.employeeId,
            },
          },
        },
        include: {
          NotificationAssignments: true,
        },
      })
      return notification
    } catch (error) {
      throw error
    }
  }

  async findAll() {
    return await this.prisma.notification.findMany({
      include: {
        NotificationAssignments: true,
      },
    })
  }

  async findOne(id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
      include: {
        NotificationAssignments: true,
      },
    })
    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`)
    }
    return notification
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto) {
    await this.findOne(id)
    return await this.prisma.notification.update({
      where: { id },
      data: updateNotificationDto,
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return await this.prisma.notification.delete({
      where: { id },
    })
  }
}
