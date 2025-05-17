import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateFoodDto, UpdateFoodDto } from './food.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class FoodsService {
  constructor(private prisma: PrismaService) {}

  async create(createFoodDto: CreateFoodDto) {
    try {
      return await this.prisma.food.create({
        data: createFoodDto,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Food name already exists')
        }
      }
      throw error
    }
  }

  async findAll() {
    return await this.prisma.food.findMany()
  }

  async findOne(id: string) {
    const food = await this.prisma.food.findUnique({
      where: { id },
    })

    if (!food) {
      throw new NotFoundException(`Food with ID ${id} not found`)
    }

    return food
  }

  async update(id: string, updateFoodDto: UpdateFoodDto) {
    try {
      return await this.prisma.food.update({
        where: { id },
        data: updateFoodDto,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Food with ID ${id} not found`)
        }
        if (error.code === 'P2002') {
          throw new ConflictException('Food name already exists')
        }
      }
      throw error
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.food.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Food with ID ${id} not found`)
        }
      }
      throw error
    }
  }
}
