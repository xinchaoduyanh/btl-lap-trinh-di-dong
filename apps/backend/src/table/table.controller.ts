import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { TableService } from './table.service'
import {
  CreateTableDto,
  UpdateTableDto,
  createTableSchema,
  updateTableSchema,
} from './schemas/table.schema'
import { TableStatus } from './enums/table-status.enum'
import { ZodValidationPipe } from 'nestjs-zod'

@Controller('tables')
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createTableSchema))
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
    @Body(new ZodValidationPipe(updateTableSchema))
    updateTableDto: UpdateTableDto
  ) {
    return this.tableService.update(id, updateTableDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tableService.remove(id)
  }
}
