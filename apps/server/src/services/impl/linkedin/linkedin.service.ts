import { IService } from '../../../interfaces/service.interface';
import { LinkedInNewPostAction } from './actions/linkedin_new_post.action';
import { LinkedInPostReaction } from './reactions/linkedin_post.reaction';
import { LinkedInShareLinkReaction } from './reactions/linkedin_share_link.reaction';

export const LinkedInService: IService = {
  id: 'linkedin',
  name: 'LinkedIn',
  version: '1.0.0',
  description: 'Integration with LinkedIn social network.',
  is_oauth: true,
  actions: [
    LinkedInNewPostAction
  ],
  reactions: [
    LinkedInPostReaction,
    LinkedInShareLinkReaction
  ],
};