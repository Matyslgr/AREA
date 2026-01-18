import { AxiosAdapter } from '@area/shared';
import { IReaction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface SpotifyRemoveTrackParams {
  playlist_id: string;
  track_uri: string;
}

export const SpotifyRemoveTrackReaction: IReaction<SpotifyRemoveTrackParams> = {
  id: 'SPOTIFY_REMOVE_FROM_PLAYLIST',
  name: 'Remove Track from Playlist',
  description: 'Removes a song from a specific playlist.',

  parameters: [
    {
      name: 'playlist_id',
      description: 'Spotify Playlist ID',
      type: 'string',
      required: true
    },
    {
      name: 'track_uri',
      description: 'Track URI (spotify:track:...)',
      type: 'string',
      required: true
    }
  ],

  scopes: ['playlist-modify-public', 'playlist-modify-private'],

  execute: async (user: UserWithAccounts, params: SpotifyRemoveTrackParams) => {
    try {
      const token = await getAccessTokenWithRefresh(user, 'spotify');
      const http = new AxiosAdapter();
      const url = `https://api.spotify.com/v1/playlists/${params.playlist_id}/tracks`;

      await http.delete(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        params: {
          uris: params.track_uri
        }
      });

      console.log(`[Spotify] Track removed from playlist for user ${user.username}`);

    } catch (error: any) {
      if (error.response?.status === 404) {
        throw new Error('Spotify: Playlist or track not found.');
      }

      console.error('[Spotify] Failed to remove track from playlist:', error.message);
    }
  }
};