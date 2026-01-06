import { AxiosAdapter } from '@area/shared';
import { IReaction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface SpotifyStartPlaybackParams {
  context_uri?: string; // Ex: spotify:album:5ht7ItJpBhLM56kPx18...
}

export const SpotifyStartPlaybackReaction: IReaction<SpotifyStartPlaybackParams> = {
  id: 'SPOTIFY_START_PLAYBACK',
  name: 'Start Playback',
  description: 'Starts or resumes playback on the user\'s active device.',

  parameters: [
    {
      name: 'context_uri',
      description: 'Spotify URI (album, playlist) to play. Leave empty to resume current track.',
      type: 'string',
      required: false
    }
  ],

  scopes: ['user-modify-playback-state'],

  execute: async (user: UserWithAccounts, params: SpotifyStartPlaybackParams) => {
    try {
      const token = await getAccessTokenWithRefresh(user, 'spotify');
      const url = 'https://api.spotify.com/v1/me/player/play';
      const http = new AxiosAdapter();
      const body = params.context_uri && params.context_uri.trim() !== ''
        ? { context_uri: params.context_uri }
        : {};

      await http.put(url, body, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`[Spotify] Playback started for user ${user.username}`);

    } catch (error: any) {
      if (error.response) {
        const status = error.response.status;
        const reason = error.response.data?.error?.reason;

        if (status === 404 || reason === 'NO_ACTIVE_DEVICE') {
            throw new Error('Spotify: No active device found. Please open Spotify on one of your devices.');
        }

        if (status === 403) {
            throw new Error('Spotify: Premium account required or playback restriction.');
        }
      }

      console.error('[Spotify] Failed to start playback:', error.message);
    }
  }
};