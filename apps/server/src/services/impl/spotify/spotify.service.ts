import { IService } from '../../../interfaces/service.interface';
import { SpotifyAddToPlaylistReaction } from './reactions/spotify_add_to_playlist.reaction';
import { SpotifyNewSavedTrackAction } from './actions/spotify_new_saved_track.action';
import { SpotifyTrackChangeAction } from './actions/spotify_track_change.action';
import { SpotifyRemoveTrackReaction } from './reactions/spotify_remove_track.reaction';

export const SpotifyService: IService = {
  id: 'spotify',
  name: 'Spotify',
  version: '1.0.0',
  description: 'Integration with Spotify music service.',
  is_oauth: true,
  actions: [
    SpotifyNewSavedTrackAction,
    SpotifyTrackChangeAction
  ],
  reactions: [
    SpotifyAddToPlaylistReaction,
    SpotifyRemoveTrackReaction
  ],
};