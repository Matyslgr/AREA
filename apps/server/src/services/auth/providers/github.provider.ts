import { IOAuthProvider, OAuthTokens, OAuthUser } from '../../../interfaces/auth.interface';
import { IHttpClient, AxiosAdapter } from '@area/shared';
interface GitHubTokenResponse {
  access_token: string;
  scope: string;
  token_type: string;
}

interface GitHubUserResponse {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

interface GitHubEmailResponse {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

export class GithubProvider implements IOAuthProvider {
  name = 'github';
  authorizationUrl = 'https://github.com/login/oauth/authorize';
  defaultScopes = ['user:email', 'read:user'];

  private httpClient: IHttpClient;

  constructor(httpClient: IHttpClient = new AxiosAdapter()) {
    this.httpClient = httpClient;
  }

  async getTokens(code: string): Promise<OAuthTokens> {
    const url = 'https://github.com/login/oauth/access_token';

    const config = {
      headers: { Accept: 'application/json' }
    };

    const payload = {
      client_id: process.env.GITHUB_CLIENT_ID,
      client_secret: process.env.GITHUB_CLIENT_SECRET,
      code,
    };

    try {
      const data = await this.httpClient.post<GitHubTokenResponse>(url, payload, config);

      console.log('GitHub Token Response:', data);
      return {
        access_token: data.access_token,
        refresh_token: undefined,
        expires_in: 0,
        scope: data.scope.replace(/,/g, ' ')
      };
    } catch (error: any) {
      console.error('GitHub Token Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve GitHub tokens');
    }
  }

  async getUserInfo(token: string): Promise<OAuthUser> {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const user = await this.httpClient.get<GitHubUserResponse>('https://api.github.com/user', { headers });

      let email = user.email;

      if (!email) {
        const emails = await this.httpClient.get<GitHubEmailResponse[]>('https://api.github.com/user/emails', { headers });

        const primaryEmail = emails.find((e: GitHubEmailResponse) => e.primary && e.verified);

        if (primaryEmail) {
          email = primaryEmail.email;
        } else {
             email = emails[0]?.email || `${user.login}@no-email.github.com`;
        }
      }

      return {
        id: user.id.toString(),
        email: email!,
        name: user.name || user.login,
        avatarUrl: user.avatar_url
      };

    } catch (error: any) {
      console.error('GitHub UserInfo Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve GitHub user info');
    }
  }

  getAuthUrlParameters(): Record<string, string> {
    return {};
  }
}
