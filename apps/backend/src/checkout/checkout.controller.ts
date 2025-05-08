import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common'
import { CheckoutService } from './checkout.service'
import { CheckInDto, CheckOutDto, GetHistoryDto } from './checkout.dto'

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @Post('check-in')
  async checkIn(@Body() checkInDto: CheckInDto) {
    return this.checkoutService.checkIn(checkInDto)
  }

  @Post('check-out')
  checkOut(@Body() checkOutDto: CheckOutDto) {
    return this.checkoutService.checkOut(checkOutDto)
  }

  @Get('status/:employeeId')
  getCurrentStatus(@Param('employeeId') employeeId: string) {
    console.log('Controller received employeeId:', employeeId)
    return this.checkoutService.getCurrentStatus(employeeId)
  }

  @Get('history/:employeeId')
  async getHistory(@Param('employeeId') employeeId: string, @Query() filter: GetHistoryDto) {
    return this.checkoutService.getHistory(employeeId, filter)
  }
}

