import { AxiosAdapter } from '@area/shared';
import { IReaction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface SpotifyPlaylistParams {
  playlist_id: string;
  track_uri: string;
}

export const SpotifyAddToPlaylistReaction: IReaction<SpotifyPlaylistParams> = {
  id: 'SPOTIFY_ADD_TO_PLAYLIST',
  name: 'Add Track to Playlist',
  description: 'Adds a song to a specific playlist.',
  parameters: [
    { name: 'playlist_id', description: 'Spotify Playlist ID', type: 'string', required: true },
    { name: 'track_uri', description: 'Track URI (spotify:track:...)', type: 'string', required: true }
  ],
  scopes: ['playlist-modify-public', 'playlist-modify-private'],

  execute: async (user: UserWithAccounts, params: SpotifyPlaylistParams) => {
    const token = getAccessToken(user, 'spotify');
    const http = new AxiosAdapter();
    const url = `https://api.spotify.com/v1/playlists/${params.playlist_id}/tracks`;

    await http.post(url, {
      uris: [params.track_uri]
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};