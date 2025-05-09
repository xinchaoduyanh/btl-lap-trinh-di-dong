import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { MenuItemService } from './menu-item.service'
import {
  CreateMenuItemDto,
  UpdateMenuItemDto,
  createMenuItemSchema,
  updateMenuItemSchema,
} from './schemas/menu-item.schema'
import { ZodValidationPipe } from 'nestjs-zod'

@Controller('menu-items')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Post()
  create(
    @Body(new ZodValidationPipe(createMenuItemSchema))
    createMenuItemDto: CreateMenuItemDto
  ) {
    return this.menuItemService.create(createMenuItemDto)
  }

  @Get()
  findAll() {
    return this.menuItemService.findAll()
  }

  @Get('available')
  findAvailable() {
    return this.menuItemService.findAvailable()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.menuItemService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updateMenuItemSchema))
    updateMenuItemDto: UpdateMenuItemDto
  ) {
    return this.menuItemService.update(id, updateMenuItemDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.menuItemService.remove(id)
  }
}
