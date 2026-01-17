// apps/server/src/services/impl/twitch/actions/twitch_new_clip.action.ts
import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface TwitchClipParams {
  broadcaster_name: string;
}

interface TwitchClipState {
  lastClipId: string;
}

export const TwitchNewClipAction: IAction<TwitchClipParams, TwitchClipState> = {
  id: 'TWITCH_NEW_CLIP',
  name: 'New Clip Created',
  description: 'Triggers when a new clip is created on a specific channel.',
  parameters: [
    { name: 'broadcaster_name', description: 'Streamer Username', type: 'string', required: true }
  ],
  state: { lastClipId: '' },
  return_values: [
    { name: 'clip_url', description: 'URL of the clip' },
    { name: 'clip_title', description: 'Title of the clip' },
    { name: 'creator_name', description: 'Who created the clip' }
  ],
  scopes: [],

  check: async (user: UserWithAccounts, params: TwitchClipParams, previousState?: TwitchClipState) => {
    try {
      const token = await getAccessTokenWithRefresh(user, 'twitch');
      const clientId = process.env.TWITCH_CLIENT_ID || '';
      const http = new AxiosAdapter();

      const data = await http.get<any>(`https://api.twitch.tv/helix/users?login=${params.broadcaster_name}`, {
        headers: { Authorization: `Bearer ${token}`, 'Client-Id': clientId }
      });

      if (!data.data || data.data.length === 0) return null;
      const broadcasterId = data.data[0].id;

      const now = new Date();
      const timeWindow = new Date(now.getTime() - 15 * 60000).toISOString(); // -15 min

      const clipRes = await http.get<any>(
        `https://api.twitch.tv/helix/clips?broadcaster_id=${broadcasterId}&started_at=${timeWindow}&first=1`,
        {
          headers: { Authorization: `Bearer ${token}`, 'Client-Id': clientId }
        }
      );

      const clips = clipRes.data.data;
      if (!clips || clips.length === 0) return null;

      const latestClip = clips[0];
      const storedClipId = previousState?.lastClipId;

      if (storedClipId === latestClip.id) return null;

      return {
        save: { lastClipId: latestClip.id },
        data: {
          clip_url: latestClip.url,
          clip_title: latestClip.title,
          creator_name: latestClip.creator_name
        }
      };
    } catch (e) {
      console.error('[Twitch Clip] Error:', e);
      return null;
    }
  }
};