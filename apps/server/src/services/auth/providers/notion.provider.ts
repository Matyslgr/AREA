import { IOAuthProvider, OAuthTokens, OAuthUser } from '../../../interfaces/auth.interface';
import { IHttpClient, AxiosAdapter } from '@area/shared';
interface NotionTokenResponse {
  access_token: string;
  bot_id: string;
  duplicated_template_id: string | null;
  owner?: {
    type: "user";
    user: {
      object: "user";
      id: string;
      name: string | null;
      avatar_url: string | null;
      person?: {
        email: string;
      };
    };
  };
  workspace_name: string;
  workspace_icon: string | null;
  workspace_id: string;
}

export class NotionProvider implements IOAuthProvider {
  name = 'notion';
  authorizationUrl = 'https://api.notion.com/v1/oauth/authorize';
  defaultScopes = [];

  private httpClient: IHttpClient;

  constructor(httpClient: IHttpClient = new AxiosAdapter()) {
    this.httpClient = httpClient;
  }

  async getTokens(code: string): Promise<OAuthTokens> {
    const url = 'https://api.notion.com/v1/oauth/token';

    const clientId = process.env.NOTION_CLIENT_ID;
    const clientSecret = process.env.NOTION_CLIENT_SECRET;
    const encoded = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const headers = {
      Authorization: `Basic ${encoded}`,
      'Content-Type': 'application/json',
    };

    const payload = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: process.env.NOTION_REDIRECT_URI,
    };

    try {
      const data = await this.httpClient.post<NotionTokenResponse>(url, payload, { headers });
      console.log('Notion Token Response:', data);
      const userInfo = data.owner?.user;
      const fakeTokenPayload = JSON.stringify({
        real_token: data.access_token,
        user_data: userInfo,
        bot_id: data.bot_id,
        workspace_id: data.workspace_id,
      });

      const compositeToken = Buffer.from(fakeTokenPayload).toString('base64');

      return {
        access_token: compositeToken,
        refresh_token: undefined,
        expires_in: 0,
        scope: '',
      };
    } catch (error: any) {
      console.error('Notion Token Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve Notion tokens');
    }
  }

  async getUserInfo(compositeToken: string): Promise<OAuthUser> {
    try {
      const decoded = JSON.parse(Buffer.from(compositeToken, 'base64').toString('utf-8'));

      const user = decoded.user_data;

      if (!user || !user.person || !user.person.email) {
        throw new Error('No person/email found in Notion owner data');
      }

      return {
        id: user.id,
        email: user.person.email,
        name: user.name || 'Notion User',
        avatarUrl: user.avatar_url,
      };

    } catch (error) {
      console.error('Notion UserInfo Error:', error);
      throw new Error('Failed to parse Notion user info');
    }
  }

  getAuthUrlParameters(): Record<string, string> {
    return {
      owner: 'user',
      response_type: 'code'
    };
  }
}