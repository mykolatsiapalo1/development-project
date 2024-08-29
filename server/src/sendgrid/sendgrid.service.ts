import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class SendGridService {
  private readonly sendGridApiKey = 'YOUR_SENDGRID_API_KEY';

  constructor(private readonly configService: ConfigService) {
    console.log('process.env.SENDGRID_API_KEY', process.env.SENDGRID_API_KEY);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  }

  async authenticateDomain(domain: string): Promise<any> {
    try {
      const response = await axios.post(
        'https://api.sendgrid.com/v3/whitelabel/domains',
        {
          domain,
          subdomain: 'mail',
          automatic_security: true,
        },
        {
          headers: {
            Authorization: `Bearer ${this.sendGridApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || error.message);
    }
  }

  async verifyDomain(domainId: string): Promise<any> {
    try {
      const response = await axios.post(
        `https://api.sendgrid.com/v3/whitelabel/domains/${domainId}/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${this.sendGridApiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data || error.message);
    }
  }

  async createEmail(fromEmail: string, toEmail: string): Promise<any> {
    const msg = {
      to: toEmail,
      from: fromEmail,
      subject: 'Welcome!',
      text: 'Your email setup is complete.',
      html: '<strong>Your email setup is complete.</strong>',
    };

    try {
      await sgMail.send(msg);
      return { success: true, message: 'Email sent successfully!' };
    } catch (error) {
      throw new Error(error.response?.body || error.message);
    }
  }
}
