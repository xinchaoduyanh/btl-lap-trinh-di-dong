import { Module } from '@nestjs/common'
import { NotificationAssignmentsService } from './notification-assignments.service'
import { NotificationAssignmentsController } from './notification-assignments.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [NotificationAssignmentsController],
  providers: [NotificationAssignmentsService],
  exports: [NotificationAssignmentsService],
})
export class NotificationAssignmentsModule {}