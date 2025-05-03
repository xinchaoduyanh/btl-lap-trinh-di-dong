import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import cors from 'cors'
import { NextFunction } from 'express'
import { ZodValidationPipe } from 'nestjs-zod'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Enable Zod validation pipe
  app.useGlobalPipes(new ZodValidationPipe())

  // Enable CORS
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
  })

  // Log mỗi request đến server
  app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`)
    next()
  })

  // Listen on all network interfaces
  const port = 3000
  await app.listen(port, '0.0.0.0')

  const serverUrl = await app.getUrl()
  console.log(`Application is running on: ${serverUrl}`)
}
bootstrap()
