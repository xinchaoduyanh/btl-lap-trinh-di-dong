import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common'
import { NotificationAssignmentsService } from './notification-assignments.service'
import { CreateNotificationAssignmentDto, UpdateNotificationAssignmentDto } from './notification-assignment.dto'

@Controller('notification-assignments')
export class NotificationAssignmentsController {
  constructor(private readonly notificationAssignmentsService: NotificationAssignmentsService) {}

  @Post()
  create(@Body() createNotificationAssignmentDto: CreateNotificationAssignmentDto) {
    return this.notificationAssignmentsService.create(createNotificationAssignmentDto)
  }

  @Get()
  findAll() {
    return this.notificationAssignmentsService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationAssignmentsService.findOne(id)
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.notificationAssignmentsService.findByEmployee(employeeId)
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationAssignmentsService.markAsRead(id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationAssignmentDto: UpdateNotificationAssignmentDto) {
    return this.notificationAssignmentsService.update(id, updateNotificationAssignmentDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationAssignmentsService.remove(id)
  }
}