import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  private resend: Resend;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    this.resend = new Resend(apiKey);
  }

  async sendEmail(to: string, subject: string, content: string) {
    try {
      const response = await this.resend.emails.send({
        from: 'PolTem Akademi <info@poltemakademi.com>',
        to,
        subject,
        html: `<div style="font-family: sans-serif; line-height: 1.6; color: #333;">
                ${content.replace(/\n/g, '<br>')}
              </div>`,
      });

      if (response.error) {
        console.error('Resend API Error:', response.error);
        throw new Error(response.error.message || 'Email sending failed');
      }

      console.log('Email sent successfully! ID:', response.data.id);
      return response.data;
    } catch (error) {
      console.error('Email sending failed details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        apiKeyPrefix: this.configService.get('RESEND_API_KEY')?.substring(0, 3)
      });
      throw error;
    }
  }
}
