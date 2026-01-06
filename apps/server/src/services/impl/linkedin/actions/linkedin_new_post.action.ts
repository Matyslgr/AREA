import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface LinkedInPostState {
  lastPostUrn: string;
}

export const LinkedInNewPostAction: IAction<{}, LinkedInPostState> = {
  id: 'LINKEDIN_NEW_POST',
  name: 'New Post Published',
  description: 'Triggers when you publish a new post on your profile.',
  parameters: [],
  state: { lastPostUrn: '' },
  return_values: [
    { name: 'content', description: 'Text content of the post' },
    { name: 'urn', description: 'Unique Resource Name (ID) of the post' },
    { name: 'link', description: 'Direct link to the post (reconstructed)' }
  ],
  scopes: ['r_member_social', 'profile', 'openid'],

  check: async (user: UserWithAccounts, _params: {}, previousState?: LinkedInPostState) => {
    try {
      const token = getAccessToken(user, 'linkedin');
      const http = new AxiosAdapter();

      const profile = await http.get<any>('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userId = profile.sub; // ex: "12345abc"

      const authorUrn = `urn:li:person:${userId}`;
      const url = `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=List(${encodeURIComponent(authorUrn)})&sortBy=CREATED&count=1`;

      const response = await http.get<any>(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const elements = response.elements;
      if (!elements || elements.length === 0) return null;

      const latestPost = elements[0];
      const currentUrn = latestPost.id;
      const storedUrn = previousState?.lastPostUrn;

      // 3. Initialisation
      if (!storedUrn) {
        return {
          save: { lastPostUrn: currentUrn },
          data: null
        };
      }

      // 4. Détection
      if (currentUrn !== storedUrn) {

        const text = latestPost.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text || '';

        const postId = currentUrn.split(':').pop();
        const publicLink = `https://www.linkedin.com/feed/update/${currentUrn}`;

        return {
          save: { lastPostUrn: currentUrn },
          data: {
            content: text,
            urn: currentUrn,
            link: publicLink
          }
        };
      }

      return null;
    } catch (e) {
      console.error('[LinkedIn] Check failed:', e);
      return null;
    }
  }
};