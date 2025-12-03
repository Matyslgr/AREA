import { User } from '@prisma/client';
import axios from 'axios';
import { IReaction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';

interface GoogleSendEmailParams {
  to: string;
  subject: string;
  body: string;
}

export const GoogleSendEmailReaction: IReaction<GoogleSendEmailParams> = {
  id: 'GMAIL_SEND_EMAIL',
  name: 'Send Email via Gmail',
  description: 'Sends an email using your Gmail account.',
  parameters: [
    { name: 'to', description: 'Recipient Email', type: 'string', required: true },
    { name: 'subject', description: 'Subject Line', type: 'string', required: true },
    { name: 'body', description: 'Email Content', type: 'string', required: true },
  ],
  execute: async (user: User, params: GoogleSendEmailParams, _actionData: any) => {
    try {
      const token = getAccessToken(user, 'google');

      const emailContent = [
        `To: ${params.to}`,
        'Content-Type: text/plain; charset=utf-8',
        'MIME-Version: 1.0',
        `Subject: ${params.subject}`,
        '',
        params.body
      ].join('\r\n');

      const encodedMessage = Buffer.from(emailContent)
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      // 4. Appel API
      const url = 'https://gmail.googleapis.com/gmail/v1/users/me/messages/send';

      await axios.post(
        url,
        { raw: encodedMessage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log(`[Gmail] Email sent to ${params.to}`);

    } catch (error: any) {
      console.error('Error in Gmail Reaction:', error.response?.data || error.message);
      throw new Error('Failed to send email via Gmail');
    }
  }
};