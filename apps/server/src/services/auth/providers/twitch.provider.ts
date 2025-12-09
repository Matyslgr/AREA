import { IOAuthProvider, OAuthTokens, OAuthUser } from '../../../interfaces/auth.interface';
import { IHttpClient, AxiosAdapter } from '@area/shared';

interface TwitchTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string[];
  token_type: string;
}

interface TwitchUserResponse {
  data: Array<{
    id: string;
    login: string;
    display_name: string;
    email: string;
    profile_image_url: string;
  }>;
}

export class TwitchProvider implements IOAuthProvider {
  name = 'twitch';
  authorizationUrl = 'https://id.twitch.tv/oauth2/authorize';
  defaultScopes = ['user:read:email'];

  private httpClient: IHttpClient;

  constructor(httpClient: IHttpClient = new AxiosAdapter()) {
    this.httpClient = httpClient;
  }

  async getTokens(code: string): Promise<OAuthTokens> {
    const url = 'https://id.twitch.tv/oauth2/token';

    const payload = {
      client_id: process.env.TWITCH_CLIENT_ID,
      client_secret: process.env.TWITCH_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: process.env.TWITCH_REDIRECT_URI,
    };

    try {
      const data = await this.httpClient.post<TwitchTokenResponse>(url, payload);

      console.log('Twitch Token Response:', data);
      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        scope: Array.isArray(data.scope) ? data.scope.join(' ') : data.scope,
      };
    } catch (error: any) {
      console.error('Twitch Token Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve Twitch tokens');
    }
  }

  async getUserInfo(token: string): Promise<OAuthUser> {
    const url = 'https://api.twitch.tv/helix/users';

    try {
      const headers = {
        Authorization: `Bearer ${token}`,
        'Client-Id': process.env.TWITCH_CLIENT_ID!,
      };

      const response = await this.httpClient.get<TwitchUserResponse>(url, { headers });

      // Twitch returns an array of users, we take the first one
      const user = response.data[0];

      if (!user) {
        throw new Error('No user data returned by Twitch');
      }

      return {
        id: user.id,
        email: user.email,
        name: user.display_name,
        avatarUrl: user.profile_image_url
      };
    } catch (error: any) {
      console.error('Twitch UserInfo Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve Twitch user info');
    }
  }

  getAuthUrlParameters(): Record<string, string> {
    return {};
  }
}