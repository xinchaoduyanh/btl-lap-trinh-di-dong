import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { SlogansService } from './slogans.service'
import { CreateSloganDto, UpdateSloganDto } from './slogan.dto'

@Controller('slogans')
export class SlogansController {
  constructor(private readonly slogansService: SlogansService) {}

  @Post()
  create(@Body() createSloganDto: CreateSloganDto) {
    return this.slogansService.create(createSloganDto)
  }

  @Get()
  findAll() {
    return this.slogansService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.slogansService.findOne(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSloganDto: UpdateSloganDto) {
    return this.slogansService.update(id, updateSloganDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.slogansService.remove(id)
  }
}