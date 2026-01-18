import { IService } from '../../../interfaces/service.interface';
import { GoogleSendEmailReaction } from './reactions/google_send_email.reaction';
import { GoogleNewMailAction } from './actions/google_new_mail.action';

export const GoogleService: IService = {
  id: 'google',
  name: 'Google',
  version: '1.0.0',
  description: 'Integration with Google Services (Gmail).',
  is_oauth: true,
  actions: [
    GoogleNewMailAction
  ],
  reactions: [
    GoogleSendEmailReaction
  ],
};
