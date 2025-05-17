import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTableDto, UpdateTableDto } from './table.dto'
import { TableStatus } from '@prisma/client'
import { Prisma } from '@prisma/client'

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async create(createTableDto: CreateTableDto) {
    const status = createTableDto.status ?? 'AVAILABLE'
    try {
      return await this.prisma.table.create({
        data: {
          ...createTableDto,
          status,
        },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException('Table number already exists')
        }
      }
      throw error
    }
  }

  async findAll() {
    return await this.prisma.table.findMany({
      orderBy: {
        number: 'asc',
      },
    })
  }

  async findOne(id: string) {
    const table = await this.prisma.table.findUnique({
      where: { id },
    })

    if (!table) {
      throw new NotFoundException(`Table with ID ${id} not found`)
    }

    return table
  }

  async update(id: string, updateTableDto: UpdateTableDto) {
    // Kiểm tra bàn có tồn tại không
    const existingTable = await this.prisma.table.findUnique({
      where: { id },
    })

    if (!existingTable) {
      throw new NotFoundException(`Table with ID ${id} not found`)
    }

    // Kiểm tra number nếu có trong update
    if (updateTableDto.number !== undefined) {
      if (updateTableDto.number <= 0) {
        throw new BadRequestException('Table number must be greater than 0')
      }

      // Kiểm tra số bàn đã tồn tại chưa (trừ bàn hiện tại)
      const tableWithSameNumber = await this.prisma.table.findFirst({
        where: {
          number: updateTableDto.number,
          id: { not: id }, // Loại trừ bàn hiện tại
        },
      })

      if (tableWithSameNumber) {
        throw new ConflictException('Table number already exists')
      }
    }

    try {
      return await this.prisma.table.update({
        where: { id },
        data: updateTableDto,
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Table with ID ${id} not found`)
        }
      }
      throw error
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.table.delete({
        where: { id },
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          throw new NotFoundException(`Table with ID ${id} not found`)
        }
      }
      throw error
    }
  }
}
