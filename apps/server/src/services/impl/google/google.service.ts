import { IAction, IService, IReaction } from '../../../interfaces/service.interface';
import { GoogleSendEmailReaction } from './reactions/send_email.reaction';
import { GoogleNewMailAction } from './actions/new_mail.action';

export const GoogleService: IService = {
  id: 'google',
  name: 'Google',
  version: '1.0.0',
  description: 'Integration with Google Services (Gmail).',
  actions: [GoogleNewMailAction as IAction],
  reactions: [GoogleSendEmailReaction as IReaction],
};
