import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSloganDto, UpdateSloganDto } from './slogan.dto'

@Injectable()
export class SlogansService {
  constructor(private prisma: PrismaService) {}

  async create(createSloganDto: CreateSloganDto) {
    try {
      const slogan = await this.prisma.slogan.create({
        data: {
          content: createSloganDto.content,
          isVisible: createSloganDto.isVisible,
        },
      })
      return slogan
    } catch (error) {
      throw error
    }
  }

  async findAll() {
    return await this.prisma.slogan.findMany()
  }

  async findVisible() {
    return await this.prisma.slogan.findMany({
      where: {
        isVisible: true,
      },
    })
  }

  async findOne(id: string) {
    const slogan = await this.prisma.slogan.findUnique({
      where: { id },
    })
    if (!slogan) {
      throw new NotFoundException(`Slogan with ID ${id} not found`)
    }
    return slogan
  }

  async update(id: string, updateSloganDto: UpdateSloganDto) {
    await this.findOne(id)
    return await this.prisma.slogan.update({
      where: { id },
      data: updateSloganDto,
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return await this.prisma.slogan.delete({
      where: { id },
    })
  }
}
