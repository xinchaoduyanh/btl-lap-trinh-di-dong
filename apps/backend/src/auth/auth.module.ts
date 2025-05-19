// apps/backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { PrismaModule } from '../prisma/prisma.module'
import { EmailModule } from 'apps/backend/src/email/email.module'

@Module({
  imports: [PrismaModule, EmailModule],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}