import { AxiosAdapter } from '@area/shared';
import { IReaction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface TwitchMsgParams {
  channel_name: string;
  message: string;
}

export const TwitchSendMessageReaction: IReaction<TwitchMsgParams> = {
  id: 'TWITCH_SEND_MESSAGE',
  name: 'Send Chat Message',
  description: 'Sends a message to a Twitch chat channel.',
  parameters: [
    { name: 'channel_name', description: 'Channel to send message to', type: 'string', required: true },
    { name: 'message', description: 'Content of the message', type: 'string', required: true }
  ],
  scopes: ['user:write:chat'],

  execute: async (user: UserWithAccounts, params: TwitchMsgParams) => {
    const token = await getAccessTokenWithRefresh(user, 'twitch');
    const clientId = process.env.TWITCH_CLIENT_ID || '';
    const http = new AxiosAdapter();

    const data = await http.get<any>('https://api.twitch.tv/helix/users', {
      headers: { Authorization: `Bearer ${token}`, 'Client-Id': clientId }
    });

    if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
      throw new Error('Failed to get current Twitch user information');
    }

    const senderId = data.data[0].id;

    let broadcasterId = senderId;
    if (params.channel_name.toLowerCase() !== data.data[0].login.toLowerCase()) {
        const targetRes = await http.get<any>(`https://api.twitch.tv/helix/users?login=${params.channel_name}`, {
            headers: { Authorization: `Bearer ${token}`, 'Client-Id': clientId }
        });
        if (targetRes.data && Array.isArray(targetRes.data.data) && targetRes.data.data.length > 0) {
            broadcasterId = targetRes.data.data[0].id;
        } else {
            throw new Error(`Twitch channel ${params.channel_name} not found`);
        }
    }

    await http.post(
      'https://api.twitch.tv/helix/chat/messages',
      {
        broadcaster_id: broadcasterId,
        sender_id: senderId,
        message: params.message
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Client-Id': clientId,
          'Content-Type': 'application/json'
        }
      }
    );
  }
};