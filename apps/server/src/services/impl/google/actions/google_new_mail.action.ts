import axios from 'axios';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface GoogleNewMailParams {
  filter_subject?: string;
}

interface GoogleNewMailState {
  lastMessageId: string;
}

export const GoogleNewMailAction: IAction<GoogleNewMailParams, GoogleNewMailState> = {
  id: 'GMAIL_NEW_MAIL',
  name: 'New Email Received',
  description: 'Triggers when a new email lands in your inbox.',
  parameters: [
    { name: 'filter_subject', description: 'Filter by subject (optional)', type: 'string', required: false }
  ],
  state: {
    lastMessageId: ''
  },
  scopes: ['https://www.googleapis.com/auth/gmail.readonly'],

  check: async (user: UserWithAccounts, params: GoogleNewMailParams, previousState?: GoogleNewMailState) => {
    try {
      const token = await getAccessTokenWithRefresh(user, 'google');

      const listUrl = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';
      const listResponse = await axios.get(listUrl, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          maxResults: 1,
          q: params.filter_subject ? `subject:${params.filter_subject}` : undefined
        }
      });

      const messages = listResponse.data.messages;

      if (!messages || messages.length === 0) return null;

      const latestMessageId = messages[0].id;
      const storedMessageId = previousState?.lastMessageId;

      if (!storedMessageId) {
        return {
          save: { lastMessageId: latestMessageId },
          data: null
        };
      }

      if (latestMessageId !== storedMessageId) {

        const detailUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${latestMessageId}`;
        const detailResponse = await axios.get(detailUrl, {
          headers: { Authorization: `Bearer ${token}` }
        });

        const headers = detailResponse.data.payload.headers;
        const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
        const from = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';
        const snippet = detailResponse.data.snippet;

        return {
          save: { lastMessageId: latestMessageId },
          data: {
            subject: subject,
            from: from,
            snippet: snippet,
            link: `https://mail.google.com/mail/u/0/#inbox/${latestMessageId}`
          }
        };
      }

      return null;

    } catch (error) {
      console.error('Error checking Gmail:', error);
      return null;
    }
  }
};