// apps/server/src/services/impl/twitch/actions/twitch_game_changed.action.ts
import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface TwitchGameParams {
  streamer_login: string;
}

interface TwitchGameState {
  lastGameName: string;
}

export const TwitchGameChangedAction: IAction<TwitchGameParams, TwitchGameState> = {
  id: 'TWITCH_GAME_CHANGED',
  name: 'Stream Game Changed',
  description: 'Triggers when a live streamer changes the game/category.',
  parameters: [
    { name: 'streamer_login', description: 'Streamer Username', type: 'string', required: true }
  ],
  state: { lastGameName: '' },
  return_values: [
    { name: 'game', description: 'New Game Name', example: 'Minecraft' },
    { name: 'title', description: 'Stream Title', example: 'Playing Hardcore' },
    { name: 'streamer', description: 'Streamer Name', example: 'ninja' }
  ],
  scopes: [],

  check: async (user: UserWithAccounts, params: TwitchGameParams, previousState?: TwitchGameState) => {
    try {
      const token = await getAccessTokenWithRefresh(user, 'twitch');
      const clientId = process.env.TWITCH_CLIENT_ID || '';
      const http = new AxiosAdapter();

      const data = await http.get<any>(`https://api.twitch.tv/helix/streams?user_login=${params.streamer_login}`, {
        headers: { Authorization: `Bearer ${token}`, 'Client-Id': clientId }
      });

      const streams = data.data;

      if (!streams || streams.length === 0) return null;

      const currentStream = streams[0];
      const currentGame = currentStream.game_name;
      const storedGame = previousState?.lastGameName;

      if (!storedGame) {
        return {
          save: { lastGameName: currentGame },
          data: null
        };
      }

      if (currentGame !== storedGame) {
        return {
          save: { lastGameName: currentGame },
          data: {
            game: currentGame,
            title: currentStream.title,
            streamer: params.streamer_login
          }
        };
      }

      return null;
    } catch (e) {
      return null;
    }
  }
};