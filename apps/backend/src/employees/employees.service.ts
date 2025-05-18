import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto'


@Injectable()
export class EmployeesService {
  constructor(private prisma: PrismaService) {}

  async create(createEmployeeDto: CreateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { email: createEmployeeDto.email },
    })

    if (employee) {
      throw new BadRequestException('Employee already exists')
    }

    return this.prisma.employee.create({
      data: {
        ...createEmployeeDto,
        password: createEmployeeDto.password,
      },
    })
  }

  async findAll() {
    return this.prisma.employee.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })
  }

  async findOne(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    })

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`)
    }

    return employee
  }

  async update(id: string, updateEmployeeDto: UpdateEmployeeDto) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    })

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`)
    }

    let data = { ...updateEmployeeDto }

    return this.prisma.employee.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        password: true,
      },
    })
  }

  async remove(id: string) {
    const employee = await this.prisma.employee.findUnique({
      where: { id },
    })

    if (!employee) {
      throw new NotFoundException(`Employee with ID ${id} not found`)
    }

    return this.prisma.employee.delete({
      where: { id },
    })
  }
}
