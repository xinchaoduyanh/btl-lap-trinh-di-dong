import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTableDto, UpdateTableDto } from './table.dto'
import { TableStatus } from './table.dto'
import { Prisma } from '@prisma/client'

@Injectable()
export class TableService {
  constructor(private prisma: PrismaService) {}

  async create(createTableDto: CreateTableDto) {
    try {
      return await this.prisma.table.create({
        data: createTableDto,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Table number already exists')
      }
      throw error
    }
  }

  async findAll(status?: TableStatus) {
    const where = status && status !== TableStatus.ALL ? { status } : {}

    return this.prisma.table.findMany({
      where,
      include: {
        orders: true,
      },
    })
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
      include: {
        orders: true,
      },
    })

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`)
    }

    return table
  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    try {
      return await this.prisma.table.update({
        where: { id },
        data: updateTableDto,
        include: {
          orders: true,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Table number already exists')
      }
      throw new NotFoundException(`Table with ID ${id} not found`)
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.table.delete({
        where: { id },
      })
    } catch (error) {
      throw new NotFoundException(`Table with ID ${id} not found`)
    }
  }
}
