import { IService } from '../../../interfaces/service.interface';
import { TwitchStreamLiveAction } from './actions/twitch_stream_live.action';
import { TwitchGameChangedAction } from './actions/twitch_game_changed.action';
import { TwitchNewClipAction } from './actions/twitch_new_clip.action';
import { TwitchSendMessageReaction } from './reactions/twitch_send_message.reaction';

export const TwitchService: IService = {
  id: 'twitch',
  name: 'Twitch',
  version: '1.0.0',
  description: 'Integration with Twitch streaming platform.',
  is_oauth: true,
  actions: [
    TwitchStreamLiveAction,
    TwitchGameChangedAction,
    TwitchNewClipAction
  ],
  reactions: [
    TwitchSendMessageReaction
  ],
};