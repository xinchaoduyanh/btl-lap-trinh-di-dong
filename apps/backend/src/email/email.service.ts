import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import * as fs from 'fs'
import * as path from 'path'

@Injectable()
export class EmailService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendOtpEmail(to: string, otp: string) {
    // Ưu tiên tìm trong dist (production), nếu không có thì tìm trong src (dev)
    let templatePath = path.join(__dirname, 'templates', 'otp.html')
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), 'src', 'email', 'templates', 'otp.html')
    }
    let htmlContent = fs.readFileSync(templatePath, 'utf8')
    htmlContent = htmlContent.replace('${otp}', otp)

    await this.resend.emails.send({
      from: 'duyanhdeptraivcllll@vuduyanh.id.vn',
      to,
      subject: 'CHAO MUNG DEN VOI ITHOTPOT',
      html: htmlContent,
    })
  }
}
