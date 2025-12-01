import { IOAuthProvider } from '../../interfaces/auth.interface';
import { GoogleProvider } from './providers/google.provider';
import { GithubProvider } from './providers/github.provider';
import { SpotifyProvider } from './providers/spotify.provider';

export class OAuthFactory {
  private static providers: Record<string, IOAuthProvider> = {
    google: new GoogleProvider(),
    github: new GithubProvider(),
    spotify: new SpotifyProvider(),
  };

  static getProvider(providerName: string): IOAuthProvider {
    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(`Provider ${providerName} not supported`);
    }
    return provider;
  }
}