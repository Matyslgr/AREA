import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface TwitchLiveParams {
  streamer_login: string;
}

interface TwitchLiveState {
  isLive: boolean;
}

export const TwitchStreamLiveAction: IAction<TwitchLiveParams, TwitchLiveState> = {
  id: 'TWITCH_STREAM_STARTED',
  name: 'Streamer Goes Live',
  description: 'Triggers when a specific streamer goes online.',
  parameters: [
    { name: 'streamer_login', description: 'Streamer Username', type: 'string', required: true }
  ],
  state: { isLive: false },
  scopes: ['user:read:email'],

  check: async (user: UserWithAccounts, params: TwitchLiveParams, previousState?: TwitchLiveState) => {
    try {
      const token = getAccessToken(user, 'twitch');
      const clientId = process.env.TWITCH_CLIENT_ID;
      const http = new AxiosAdapter();

      const response = await http.get<any>(`https://api.twitch.tv/helix/streams?user_login=${params.streamer_login}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Client-Id': clientId
        }
      });

      const streams = response.data; // Twitch API returns { data: [...] }
      const isCurrentlyLive = streams && streams.length > 0;
      const wasLive = previousState?.isLive || false;

      // State changed
      if (isCurrentlyLive !== wasLive) {
        if (isCurrentlyLive && !wasLive) {
           return {
             save: { isLive: true },
             data: {
               streamer: params.streamer_login,
               title: streams[0].title,
               game: streams[0].game_name,
               link: `https://twitch.tv/${params.streamer_login}`
             }
           };
        }
        return { save: { isLive: isCurrentlyLive }, data: null };
      }
      return null;
    } catch (e) { return null; }
  }
};