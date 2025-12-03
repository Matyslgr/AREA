import { IOAuthProvider, OAuthTokens, OAuthUser } from '../../../interfaces/auth.interface';
import { IHttpClient, AxiosAdapter } from '@area/shared';
// Spotify raw response types
interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

interface SpotifyUserResponse {
  id: string;
  display_name: string;
  email: string;
  images: { url: string; height: number; width: number }[];
  product: string; // 'premium' or 'free'
}

export class SpotifyProvider implements IOAuthProvider {
  name = 'spotify';
  authorizationUrl = 'https://accounts.spotify.com/authorize';
  defaultScopes = ['user-read-email', 'user-read-private'];

  private httpClient: IHttpClient;

  constructor(httpClient: IHttpClient = new AxiosAdapter()) {
    this.httpClient = httpClient;
  }

  async getTokens(code: string): Promise<OAuthTokens> {
    const url = 'https://accounts.spotify.com/api/token';

    const params = new URLSearchParams();
    params.append('grant_type', 'authorization_code');
    params.append('code', code);
    params.append('redirect_uri', process.env.SPOTIFY_REDIRECT_URI!);

    params.append('client_id', process.env.SPOTIFY_CLIENT_ID!);
    params.append('client_secret', process.env.SPOTIFY_CLIENT_SECRET!);

    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    };

    try {
      const data = await this.httpClient.post<SpotifyTokenResponse>(url, params, config);

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_in: data.expires_in,
        scope: data.scope,
      };
    } catch (error: any) {
      console.error('Spotify Token Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve Spotify tokens');
    }
  }

  async getUserInfo(token: string): Promise<OAuthUser> {
    const url = 'https://api.spotify.com/v1/me';

    try {
      const data = await this.httpClient.get<SpotifyUserResponse>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return {
        id: data.id,
        email: data.email,
        name: data.display_name,
        avatarUrl: data.images.length > 0 ? data.images[0].url : undefined
      };
    } catch (error: any) {
      console.error('Spotify UserInfo Error:', error.response?.data || error.message);
      throw new Error('Failed to retrieve Spotify user info');
    }
  }

  getAuthUrlParameters(): Record<string, string> {
    return {};
  }
}
