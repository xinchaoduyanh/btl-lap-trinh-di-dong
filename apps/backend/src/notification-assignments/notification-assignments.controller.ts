import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common'
import { NotificationAssignmentsService } from './notification-assignments.service'
import {
  CreateNotificationAssignmentDto,
  UpdateNotificationAssignmentDto,
} from './notification-assignment.dto'

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

  @Get('employee/:employeeId/unread-count')
  countUnreadByEmployee(@Param('employeeId') employeeId: string) {
    return this.notificationAssignmentsService.countUnreadByEmployee(employeeId)
  }

  @Get('employee/:employeeId/all')
  findAllByEmployee(
    @Param('employeeId') employeeId: string,
    @Query('includeDeleted') includeDeleted?: string
  ) {
    // Chuyển đổi query param string thành boolean
    const includeDeletedBool = includeDeleted === 'true'
    return this.notificationAssignmentsService.findAllByEmployee(employeeId, includeDeletedBool)
  }

  @Get('employee/:employeeId')
  findByEmployee(@Param('employeeId') employeeId: string) {
    return this.notificationAssignmentsService.findByEmployee(employeeId)
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationAssignmentsService.findOne(id)
  }

  @Patch(':id/read')
  markAsRead(@Param('id') id: string) {
    return this.notificationAssignmentsService.markAsRead(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNotificationAssignmentDto: UpdateNotificationAssignmentDto
  ) {
    return this.notificationAssignmentsService.update(id, updateNotificationAssignmentDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationAssignmentsService.remove(id)
  }

  @Get('notification/:notificationId')
  findByNotification(@Param('notificationId') notificationId: string) {
    return this.notificationAssignmentsService.findByNotification(notificationId)
  }
}
