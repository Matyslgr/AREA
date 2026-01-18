import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface SpotifyState {
  lastTrackId: string;
}

export const SpotifyNewSavedTrackAction: IAction<any, SpotifyState> = {
  id: 'SPOTIFY_NEW_SAVED_TRACK',
  name: 'New Saved Track',
  description: 'Triggers when you like a new song.',
  parameters: [],
  state: { lastTrackId: '' },
  return_values: [
    { name: 'track_name', description: 'Name of the track', example: 'Song Title' },
    { name: 'artist', description: 'Artist of the track', example: 'Artist Name' },
    { name: 'link', description: 'Link to the track on Spotify', example: 'https://open.spotify.com/track/...' },
    { name: 'uri', description: 'Spotify URI of the track', example: 'spotify:track:...' }
  ],
  scopes: ['user-library-read'],

  check: async (user: UserWithAccounts, _params, previousState?: SpotifyState) => {
    try {
      const token = await getAccessTokenWithRefresh(user, 'spotify');
      const http = new AxiosAdapter();

      const data = await http.get<any>('https://api.spotify.com/v1/me/tracks?limit=1', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!data.items || data.items.length === 0) return null;

      const latestTrack = data.items[0].track;
      const storedId = previousState?.lastTrackId;

      if (!storedId) {
        return { save: { lastTrackId: latestTrack.id }, data: null };
      }

      if (latestTrack.id !== storedId) {
        return {
          save: { lastTrackId: latestTrack.id },
          data: {
            track_name: latestTrack.name,
            artist: latestTrack.artists[0].name,
            link: latestTrack.external_urls.spotify,
            uri: latestTrack.uri
          }
        };
      }
      return null;
    } catch (e) { return null; }
  }
};