import { MailerService } from '@nestjs-modules/mailer';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';

@Injectable()
export class EmailService {
  constructor(private readonly mailService: MailerService) {}
  async sendMail({
    toMail,
    subject,
    message,
    html,
  }: {
    toMail: string;
    subject: string;
    message: string;
    html: string;
  }) {
    try {
      const sendMail = await this.mailService.sendMail({
        from: 'S3 Tracking System',
        to: toMail,
        subject,
        text: message,
        html,
      });
      return sendMail;
    } catch (error) {
      throw new HttpException(
        `ERROR_IN_SEND_EMAIL_SERVICES: ${error}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
