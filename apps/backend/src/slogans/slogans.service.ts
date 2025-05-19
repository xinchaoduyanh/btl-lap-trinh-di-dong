import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateSloganDto, UpdateSloganDto } from './slogan.dto'

@Injectable()
export class SlogansService {
  constructor(private prisma: PrismaService) {}

  async create(createSloganDto: CreateSloganDto) {
    try {
      // Create a new slogan with the provided content and isVisible status
      // If isVisible is not provided, it defaults to true (as defined in the DTO)
      // Using type assertion to avoid TypeScript errors
      // The schema has isVisible field but TypeScript doesn't recognize it
      const slogan = await this.prisma.slogan.create({
        data: {
          content: createSloganDto.content,
          isVisible: createSloganDto.isVisible,
        } as any,
      })
      return slogan
    } catch (error) {
      throw error
    }
  }

  async findAll() {
    // Return all slogans, including both visible and non-visible ones
    // Typically used in admin dashboard
    return await this.prisma.slogan.findMany()
  }

  async findVisible() {
    // Only return slogans with isVisible = true
    // Used in mobile app
    // Using type assertion to avoid TypeScript errors
    return await this.prisma.slogan.findMany({
      where: {
        isVisible: true,
      } as any,
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
    // First check if the slogan exists
    await this.findOne(id)

    // Update the slogan with the provided data
    // updateSloganDto may contain content and/or isVisible
    return await this.prisma.slogan.update({
      where: { id },
      data: updateSloganDto as any, // Type assertion to avoid TypeScript errors
    })
  }

  async remove(id: string) {
    await this.findOne(id)
    return await this.prisma.slogan.delete({
      where: { id },
    })
  }
}
