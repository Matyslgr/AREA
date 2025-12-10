import { AxiosAdapter } from '@area/shared';
import { IReaction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface LinkedInPostParams {
  content: string;
}

export const LinkedInPostReaction: IReaction<LinkedInPostParams> = {
  id: 'LINKEDIN_POST',
  name: 'Share on LinkedIn',
  description: 'Post a text message to your profile.',
  parameters: [
    { name: 'content', description: 'Message content', type: 'string', required: true }
  ],
  scopes: ['w_member_social', 'openid', 'profile', 'email'],

  execute: async (user: UserWithAccounts, params: LinkedInPostParams) => {
    const token = getAccessToken(user, 'linkedin');
    const http = new AxiosAdapter();

    // 1. Fetch User URN
    const profile = await http.get<any>('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const userId = profile.sub;

    // 2. Create Post
    await http.post('https://api.linkedin.com/v2/ugcPosts', {
      author: `urn:li:person:${userId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: params.content
          },
          shareMediaCategory: "NONE"
        }
      },
      visibility: {
        "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC"
      }
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};