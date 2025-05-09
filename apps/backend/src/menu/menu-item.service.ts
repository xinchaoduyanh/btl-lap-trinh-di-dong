import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMenuItemDto, UpdateMenuItemDto } from './schemas/menu-item.schema'

@Injectable()
export class MenuItemService {
  constructor(private prisma: PrismaService) {}

  async create(createMenuItemDto: CreateMenuItemDto) {
    return this.prisma.menuItem.create({
      data: createMenuItemDto,
    })
  }

  async findAll() {
    return this.prisma.menuItem.findMany({
      include: {
        orderItems: true,
      },
    })
  }

  async findAvailable() {
    return this.prisma.menuItem.findMany({
      where: {
        isAvailable: true,
      },
      include: {
        orderItems: true,
      },
    })
  }

  async findOne(id: string) {
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id },
      include: {
        orderItems: true,
      },
    })

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${id} not found`)
    }

    return menuItem
  }

  async update(id: string, updateMenuItemDto: UpdateMenuItemDto) {
    try {
      return await this.prisma.menuItem.update({
        where: { id },
        data: updateMenuItemDto,
        include: {
          orderItems: true,
        },
      })
    } catch (error) {
      throw new NotFoundException(`Menu item with ID ${id} not found`)
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.menuItem.delete({
        where: { id },
      })
    } catch (error) {
      throw new NotFoundException(`Menu item with ID ${id} not found`)
    }
  }
}
