/// <reference types="multer" />
import { Injectable } from '@nestjs/common'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

function checkS3Config() {
  const requiredVars = [
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_REGION',
    'AWS_S3_BUCKET_NAME',
  ]
  let hasError = false
  requiredVars.forEach((key) => {
    if (!process.env[key]) {
      console.error(`[S3 CONFIG ERROR] Thiếu biến môi trường: ${key}`)
      hasError = true
    } else {
      console.log(`[S3 CONFIG] ${key}:`, process.env[key])
    }
  })
  if (hasError) {
    throw new Error('Thiếu cấu hình AWS S3. Xem log để biết biến nào bị thiếu!')
  }
}

@Injectable()
export class UploadService {
  private s3Client: S3Client

  constructor() {
    checkS3Config()
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    })
  }

  async getSignedUrl(fileName: string, fileType: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `uploads/${Date.now()}-${fileName}`,
      ContentType: fileType,
    })

    return getSignedUrl(this.s3Client, command, { expiresIn: 3600 })
  }

  async uploadFile(file: Express.Multer.File, uniqueFileName: string): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `uploads/${uniqueFileName}`,
      Body: file.buffer,
      ContentType: file.mimetype,
    })

    await this.s3Client.send(command)
    return `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${uniqueFileName}`
  }
}
