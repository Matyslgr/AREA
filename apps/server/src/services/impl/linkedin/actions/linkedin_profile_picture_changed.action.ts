import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface LinkedInProfilePictureState {
  lastPictureUrl: string;
}

export const LinkedInProfilePictureChangedAction: IAction<{}, LinkedInProfilePictureState> = {
  id: 'LINKEDIN_PROFILE_PICTURE_CHANGED',
  name: 'Profile Picture Changed',
  description: 'Triggers when your LinkedIn profile picture is updated.',
  parameters: [],
  state: { lastPictureUrl: '' },
  return_values: [
    { name: 'picture_url', description: 'URL of the new profile picture' },
    { name: 'name', description: 'Your full name' }
  ],
  scopes: ['profile', 'openid'],

  check: async (user: UserWithAccounts, _params: {}, previousState?: LinkedInProfilePictureState) => {
    try {
      const token = getAccessToken(user, 'linkedin');
      const http = new AxiosAdapter();

      const profile = await http.get<any>('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const currentPictureUrl = profile.picture || '';
      const storedPictureUrl = previousState?.lastPictureUrl;

      if (!storedPictureUrl) {
        return {
          save: { lastPictureUrl: currentPictureUrl },
          data: null
        };
      }

      if (currentPictureUrl !== storedPictureUrl && currentPictureUrl) {
        return {
          save: { lastPictureUrl: currentPictureUrl },
          data: {
            picture_url: currentPictureUrl,
            name: profile.name || ''
          }
        };
      }

      return null;
    } catch (e) {
      console.error('[LinkedIn] Profile picture check failed:', e);
      return null;
    }
  }
};
