import { IService } from '../../../interfaces/service.interface';
import { LinkedInProfilePictureChangedAction } from './actions/linkedin_profile_picture_changed.action';
import { LinkedInProfileNameChangedAction } from './actions/linkedin_profile_name_changed.action';
import { LinkedInProfileUpdatedAction } from './actions/linkedin_profile_updated.action';
import { LinkedInPostReaction } from './reactions/linkedin_post.reaction';
import { LinkedInShareLinkReaction } from './reactions/linkedin_share_link.reaction';

export const LinkedInService: IService = {
  id: 'linkedin',
  name: 'LinkedIn',
  version: '1.0.0',
  description: 'Integration with LinkedIn social network.',
  is_oauth: true,
  actions: [
    LinkedInProfilePictureChangedAction,
    LinkedInProfileNameChangedAction,
    LinkedInProfileUpdatedAction
  ],
  reactions: [
    LinkedInPostReaction,
    LinkedInShareLinkReaction
  ],
};