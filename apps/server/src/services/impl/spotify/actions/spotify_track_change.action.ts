import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface SpotifyTrackChangeParams {}

interface SpotifyTrackChangeState {
  lastTrackId: string;
  isPlaying: boolean;
}

export const SpotifyTrackChangeAction: IAction<SpotifyTrackChangeParams, SpotifyTrackChangeState> = {
  id: 'SPOTIFY_TRACK_CHANGED',
  name: 'Track Changed',
  description: 'Triggers when the currently playing track changes.',

  parameters: [],

  return_values: [
    { name: 'track_name', description: 'Name of the track' },
    { name: 'artist_name', description: 'Name of the main artist' },
    { name: 'album_name', description: 'Name of the album' },
    { name: 'track_url', description: 'Spotify URL of the track' },
    { name: 'cover_url', description: 'URL of the album cover image' }
  ],

  state: {
    lastTrackId: '',
    isPlaying: false
  },

  scopes: ['user-read-playback-state', 'user-read-currently-playing'],

  check: async (user: UserWithAccounts, params: SpotifyTrackChangeParams, previousState?: SpotifyTrackChangeState) => {
    try {
      const token = await getAccessTokenWithRefresh(user, 'spotify');
      const http = new AxiosAdapter();
      const url = 'https://api.spotify.com/v1/me/player/currently-playing';

      const data = await http.get<any>(url, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!data || !data.item) {
        return {
          save: { lastTrackId: '', isPlaying: false },
          data: null
        };
      }

      const item = data.item;

      if (item.type !== 'track') {
         return null;
      }

      const currentTrackId = item.id;
      const storedTrackId = previousState?.lastTrackId;

      if (!storedTrackId) {
        return {
          save: { lastTrackId: currentTrackId, isPlaying: data.is_playing },
          data: null
        };
      }

      if (currentTrackId !== storedTrackId) {

        const artistName = item.artists.map((a: any) => a.name).join(', ');
        const coverUrl = item.album.images.length > 0 ? item.album.images[0].url : '';

        return {
          save: {
            lastTrackId: currentTrackId,
            isPlaying: data.is_playing
          },
          data: {
            track_name: item.name,
            artist_name: artistName,
            album_name: item.album.name,
            track_url: item.external_urls.spotify,
            cover_url: coverUrl
          }
        };
      }

      return null;

    } catch (error) {
      console.error('Error checking Spotify playback:', error);
      return null;
    }
  }
};
