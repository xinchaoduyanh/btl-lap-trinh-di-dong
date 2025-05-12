import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { TableService } from './table.service'
import { CreateTableDto, UpdateTableDto } from './table.dto'
import { TableStatus } from './table.dto'
import { ZodValidationPipe } from 'nestjs-zod'
import { z } from 'zod'

const CreateTableSchema = z.object({
  number: z.number().int().min(1, 'Table number must be at least 1'),
  name: z.string().min(1, 'Table name is required').max(50, 'Table name is too long'),
  capacity: z
    .number()
    .int()
    .min(1, 'Capacity must be at least 1')
    .max(20, 'Capacity cannot exceed 20'),
  status: z
    .nativeEnum(TableStatus, {
      errorMap: () => ({ message: 'Invalid table status' }),
    })
    .default(TableStatus.AVAILABLE),
  location: z.string().optional(),
  description: z.string().max(200, 'Description is too long').optional(),
})

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(CreateTableDto))
    createTableDto: CreateTableDto
  ) {
    return this.tableService.create(createTableDto)
  }

  @Get()
  findAll(@Query('status') status?: TableStatus) {
    return this.tableService.findAll(status)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tableService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTableDto))
    updateTableDto: UpdateTableDto
  ) {
    return this.tableService.update(id, updateTableDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tableService.remove(id)
  }
}
