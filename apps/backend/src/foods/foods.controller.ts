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
import { FoodsService } from './foods.service'
import { CreateFoodDto, UpdateFoodDto } from './food.dto'

@Controller('foods')
export class FoodsController {
  constructor(private readonly foodsService: FoodsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFoodDto: CreateFoodDto) {
    return this.foodsService.create(createFoodDto)
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.foodsService.findAll()
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOne(@Param('id') id: string) {
    return this.foodsService.findOne(id)
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  update(@Param('id') id: string, @Body() updateFoodDto: UpdateFoodDto) {
    return this.foodsService.update(id, updateFoodDto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.foodsService.remove(id)
  }
}
