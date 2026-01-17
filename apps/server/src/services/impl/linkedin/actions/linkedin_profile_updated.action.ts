import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface LinkedInProfileState {
  lastProfile: string;
}

export const LinkedInProfileUpdatedAction: IAction<{}, LinkedInProfileState> = {
  id: 'LINKEDIN_PROFILE_UPDATED',
  name: 'Profile Updated',
  description: 'Triggers when any part of your LinkedIn profile is updated (name, picture, email, locale).',
  parameters: [],
  state: { lastProfile: '' },
  return_values: [
    { name: 'name', description: 'Your full name' },
    { name: 'given_name', description: 'Your first name' },
    { name: 'family_name', description: 'Your last name' },
    { name: 'picture_url', description: 'URL of your profile picture' },
    { name: 'email', description: 'Your primary email address' },
    { name: 'locale', description: 'Your locale/language setting' }
  ],
  scopes: ['profile', 'email', 'openid'],

  check: async (user: UserWithAccounts, _params: {}, previousState?: LinkedInProfileState) => {
    try {
      const token = getAccessToken(user, 'linkedin');
      const http = new AxiosAdapter();

      const profile = await http.get<any>('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const currentProfileSnapshot = JSON.stringify({
        name: profile.name || '',
        given_name: profile.given_name || '',
        family_name: profile.family_name || '',
        picture: profile.picture || '',
        email: profile.email || '',
        locale: profile.locale || ''
      });

      const storedProfileSnapshot = previousState?.lastProfile;

      if (!storedProfileSnapshot) {
        return {
          save: { lastProfile: currentProfileSnapshot },
          data: null
        };
      }

      if (currentProfileSnapshot !== storedProfileSnapshot) {
        return {
          save: { lastProfile: currentProfileSnapshot },
          data: {
            name: profile.name || '',
            given_name: profile.given_name || '',
            family_name: profile.family_name || '',
            picture_url: profile.picture || '',
            email: profile.email || '',
            locale: profile.locale || ''
          }
        };
      }

      return null;
    } catch (e) {
      console.error('[LinkedIn] Profile update check failed:', e);
      return null;
    }
  }
};
