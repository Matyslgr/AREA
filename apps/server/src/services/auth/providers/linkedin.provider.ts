import { IOAuthProvider, OAuthTokens, OAuthUser } from '../../../interfaces/auth.interface';
import { IHttpClient } from '../../../interfaces/http.interface';
import { AxiosAdapter } from '../../../adapters/axios.adapter';

interface LinkedInTokenResponse {
  access_token: string;
  expires_in: number;
  scope: string;
}

interface LinkedInUserResponse {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
}

export class LinkedinProvider implements IOAuthProvider {
  name = 'linkedin';
  private httpClient: IHttpClient;

  constructor(httpClient: IHttpClient = new AxiosAdapter()) {
    this.httpClient = httpClient;
  }

  async getTokens(code: string): Promise<OAuthTokens> {
    const url = 'https://www.linkedin.com/oauth/v2/accessToken';

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', process.env.LINKEDIN_REDIRECT_URI!);
    params.append('client_id', process.env.LINKEDIN_CLIENT_ID!);
    params.append('client_secret', process.env.LINKEDIN_CLIENT_SECRET!);

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    try {
      const data = await this.httpClient.post<LinkedInTokenResponse>(url, params, config);

      return {
        access_token: data.access_token,
        refresh_token: undefined,
        expires_in: data.expires_in,
      };
    } catch (error: any) {
      console.error('LinkedIn Token Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve LinkedIn tokens');
    }
  }

  async getUserInfo(token: string): Promise<OAuthUser> {
    const url = 'https://api.linkedin.com/v2/userinfo';

    try {
      const data = await this.httpClient.get<LinkedInUserResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        id: data.sub,
        email: data.email,
        name: data.name,
        avatarUrl: data.picture,
      };
    } catch (error: any) {
      console.error('LinkedIn UserInfo Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve LinkedIn user info');
    }
  }
}