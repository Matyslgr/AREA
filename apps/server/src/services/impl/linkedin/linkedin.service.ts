import { IService } from '../../../interfaces/service.interface';
import { LinkedInPostReaction } from './reactions/linkedin_post.reaction';

export const LinkedInService: IService = {
  id: 'linkedin',
  name: 'LinkedIn',
  version: '1.0.0',
  description: 'Integration with LinkedIn social network.',
  is_oauth: true,
  actions: [],
  reactions: [
    LinkedInPostReaction
  ],
};