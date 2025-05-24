/// <reference types="multer" />
import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Get,
  Query,
  BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { UploadService } from './upload.service'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuidv4 } from 'uuid'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif']

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (req, file, callback) => {
        if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
          return callback(new BadRequestException('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)'), false)
        }
        callback(null, true)
      },
    })
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const uniqueFileName = `${uuidv4()}-${file.originalname}`
    const fileUrl = await this.uploadService.uploadFile(file, uniqueFileName)
    return { url: fileUrl }
  }

  @Get('presigned-url')
  async getPresignedUrl(@Query('fileName') fileName: string, @Query('fileType') fileType: string) {
    if (!ALLOWED_FILE_TYPES.includes(fileType)) {
      throw new BadRequestException('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF)')
    }
    const url = await this.uploadService.getSignedUrl(fileName, fileType)
    return { url }
  }
}
