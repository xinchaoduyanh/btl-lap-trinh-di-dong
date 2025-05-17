import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { TablesService } from './tables.service'
import { CreateTableDto, UpdateTableDto } from './table.dto'

@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createTableDto: CreateTableDto) {
    return this.tablesService.create(createTableDto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.tablesService.findAll()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.tablesService.findOne(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateTableDto: UpdateTableDto) {
    return this.tablesService.update(id, updateTableDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.tablesService.remove(id)
  }
}
