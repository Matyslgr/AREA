import { AxiosAdapter } from '@area/shared';
import { IReaction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface LinkedInLinkParams {
  url: string;
  comment: string;
}

export const LinkedInShareLinkReaction: IReaction<LinkedInLinkParams> = {
  id: 'LINKEDIN_SHARE_LINK',
  name: 'Share Link / Article',
  description: 'Share a URL with a comment on your profile.',
  parameters: [
    { name: 'url', description: 'The URL to share (Article, Video, etc.)', type: 'string', required: true },
    { name: 'comment', description: 'Text to accompany the link', type: 'string', required: true }
  ],
  scopes: ['w_member_social', 'profile', 'openid'],

  execute: async (user: UserWithAccounts, params: LinkedInLinkParams) => {
    const token = getAccessToken(user, 'linkedin');
    const http = new AxiosAdapter();

    // 1. Fetch User ID
    const profile = await http.get<any>('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${token}` }
    });
    const userId = profile.sub;

    // 2. Create Post with Media
    await http.post('https://api.linkedin.com/v2/ugcPosts', {
      author: `urn:li:person:${userId}`,
      lifecycleState: "PUBLISHED",
      specificContent: {
        "com.linkedin.ugc.ShareContent": {
          shareCommentary: {
            text: params.comment
          },
          shareMediaCategory: "ARTICLE",
          media: [
            {
              status: "READY",
              description: {
                text: "Shared via AREA"
              },
              originalUrl: params.url,
            }
          ]
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