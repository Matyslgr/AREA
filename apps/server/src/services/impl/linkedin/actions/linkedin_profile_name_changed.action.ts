import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface LinkedInProfileNameState {
  lastName: string;
}

export const LinkedInProfileNameChangedAction: IAction<{}, LinkedInProfileNameState> = {
  id: 'LINKEDIN_PROFILE_NAME_CHANGED',
  name: 'Profile Name Changed',
  description: 'Triggers when your LinkedIn profile name is updated.',
  parameters: [],
  state: { lastName: '' },
  return_values: [
    { name: 'name', description: 'Your new full name' },
    { name: 'given_name', description: 'Your first name' },
    { name: 'family_name', description: 'Your last name' }
  ],
  scopes: ['profile', 'openid'],

  check: async (user: UserWithAccounts, _params: {}, previousState?: LinkedInProfileNameState) => {
    try {
      const token = getAccessToken(user, 'linkedin');
      const http = new AxiosAdapter();

      const profile = await http.get<any>('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const currentName = profile.name || '';
      const storedName = previousState?.lastName;

      if (!storedName) {
        return {
          save: { lastName: currentName },
          data: null
        };
      }

      if (currentName !== storedName && currentName) {
        return {
          save: { lastName: currentName },
          data: {
            name: currentName,
            given_name: profile.given_name || '',
            family_name: profile.family_name || ''
          }
        };
      }

      return null;
    } catch (e) {
      console.error('[LinkedIn] Profile name check failed:', e);
      return null;
    }
  }
};
