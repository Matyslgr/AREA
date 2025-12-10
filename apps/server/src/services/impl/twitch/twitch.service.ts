import { IService } from '../../../interfaces/service.interface';
import { TwitchStreamLiveAction } from './action/twitch_stream_live.action';

export const TwitchService: IService = {
  id: 'twitch',
  name: 'Twitch',
  version: '1.0.0',
  description: 'Integration with Twitch streaming platform.',
  is_oauth: true,
  actions: [
    TwitchStreamLiveAction
  ],
  reactions: [],
};