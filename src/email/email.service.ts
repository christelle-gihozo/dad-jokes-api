import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtService } from '@nestjs/jwt'
import * as Mail from 'nodemailer/lib/mailer'
import { createTransport } from 'nodemailer'

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name)
  private nodemailerTransport

  constructor(
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.nodemailerTransport = createTransport({
      host: configService.get('EMAIL_HOST'),
      port: 465,
      secure: true,
      auth: {
        user: configService.get('EMAIL_USER'),
        pass: configService.get('EMAIL_PASSWORD'),
      },
    })
  }

  async sendResetPasswordLink(email: string, userId: number): Promise<void> {
    const payload = { email, userId }

    const token = this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('2700')}s`, // Default to 45 minutes
    })

    const url = `${this.configService.get('EMAIL_RESET_PASSWORD_URL')}?token=${token}`

    const text = `Hi, \nTo reset your password, click here: ${url}`
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset Request</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #F7F3EF; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #2D1B0F;">
        <div style="max-width: 480px; margin: 32px auto; background-color: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 6px 24px rgba(74,50,32,0.12); border: 1px solid #E5D6C6;">
          <!-- Header -->
          <div style="background-color: #4A3220; padding: 32px 24px 18px 24px; text-align: center; border-bottom: 1px solid #E5D6C6;">
            <img src="https://drive.google.com/uc?export=view&id=1QVp0JX1xj03SybBzAqEj_g5FufzzEJVX" alt="Dad jokes app logo" width="72" height="72" style="display:block;margin:0 auto 12px auto;border-radius:50%;background:#fff;box-shadow:0 2px 8px rgba(74,50,32,0.08);" />
            <h1 style="color: #FF6FAE; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px;">Password Reset</h1>
          </div>
          <!-- Content -->
          <div style="padding: 28px 24px 18px 24px;">
            <p style="color: #2D1B0F; line-height: 1.7; margin: 0 0 18px 0; font-size: 15px;">
              You requested a password reset for your Dad Jokes account. Click the button below to create a new password.
            </p>
            <!-- CTA Button -->
            <div style="text-align: center; margin: 28px 0;">
              <a href="${url}" style="display: inline-block; background-color: #FF6FAE; color: #fff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 700; font-size: 16px; box-shadow: 0 2px 8px rgba(255,111,174,0.12); border: none; letter-spacing: 0.5px;">
                Reset Password
              </a>
            </div>
            <div style="background-color: #FFF6F9; border-left: 4px solid #FF6FAE; padding: 12px; margin: 22px 0; border-radius: 6px;">
              <p style="color: #4A3220; margin: 0; font-size: 13px;">
                ⚠️ <strong>Important:</strong> This link will expire in 45 minutes for security reasons.
              </p>
            </div>
            <p style="color: #7A5C3A; line-height: 1.6; margin: 18px 0 0 0; font-size: 13px;">
              If you didn't request this password reset, you can safely ignore this email. Your password will remain unchanged.
            </p>
          </div>
          <!-- Footer -->
          <div style="background-color: #F7F3EF; padding: 18px 24px; text-align: center; border-top: 1px solid #E5D6C6;">
            <p style="color: #4A3220; margin: 0; font-size: 12px; font-weight: 500;">
              © 2025 Dad Jokes. All rights reserved.
            </p>
            <p style="color: #7A5C3A; margin: 6px 0 0 0; font-size: 12px;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendMail({
      to: email,
      subject: 'Reset password',
      text,
      html,
    })
  }

  private sendMail(options: Mail.Options) {
    this.logger.log('Email sent out to', options.to)
    return this.nodemailerTransport.sendMail(options)
  }
}
