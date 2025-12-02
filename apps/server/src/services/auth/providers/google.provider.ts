import { IOAuthProvider, OAuthTokens, OAuthUser } from '../../../interfaces/auth.interface';
import { IHttpClient } from '../../../interfaces/http.interface';
import { AxiosAdapter } from '../../../adapters/axios.adapter';

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
  id_token: string;
}

interface GoogleUserInfoResponse {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

export class GoogleProvider implements IOAuthProvider {
  name = 'google';
  private httpClient: IHttpClient;

  constructor(httpClient: IHttpClient = new AxiosAdapter()) {
    this.httpClient = httpClient;
  }

  async getTokens(code: string): Promise<OAuthTokens> {
    const url = 'https://oauth2.googleapis.com/token';

    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
      throw new Error('Google env vars missing');
    }

    const payload = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    };

    try {
      const data = await this.httpClient.post<GoogleTokenResponse>(url, payload);

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
      };
    } catch (error: any) {
      console.error('Google Token Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve Google tokens');
    }
  }

  async getUserInfo(token: string): Promise<OAuthUser> {
    const url = 'https://www.googleapis.com/oauth2/v2/userinfo';

    try {
      const data = await this.httpClient.get<GoogleUserInfoResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        id: data.id,
        email: data.email,
        name: data.name,
        avatarUrl: data.picture,
      };
    } catch (error: any) {
      console.error('Google UserInfo Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve Google user info');
    }
  }
}