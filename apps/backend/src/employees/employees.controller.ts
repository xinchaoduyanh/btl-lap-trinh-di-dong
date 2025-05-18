import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common'
import { EmployeesService } from './employees.service'
import { CreateEmployeeDto, UpdateEmployeeDto } from './dto/employee.dto'

import { Role } from '@prisma/client'
import { ZodValidationPipe } from 'nestjs-zod'
import { createEmployeeSchema, updateEmployeeSchema } from './dto/employee.dto'

@Controller('employees')

export class EmployeesController {
  constructor(private readonly employeesService: EmployeesService) {}

  @Post()
  create(@Body(new ZodValidationPipe(createEmployeeSchema)) createEmployeeDto: CreateEmployeeDto) {
    return this.employeesService.create(createEmployeeDto)
  }

  @Get()
  findAll() {
    return this.employeesService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.employeesService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateEmployeeSchema)) updateEmployeeDto: UpdateEmployeeDto
  ) {
    return this.employeesService.update(id, updateEmployeeDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.employeesService.remove(id)
  }
}
