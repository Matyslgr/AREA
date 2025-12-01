import { IOAuthProvider } from '../../interfaces/auth.interface';
import { GoogleProvider } from './providers/google.provider';
import { GithubProvider } from './providers/github.provider';
import { SpotifyProvider } from './providers/spotify.provider';
import { TwitchProvider } from './providers/twitch.provider';

export class OAuthFactory {
  private static providers: Record<string, IOAuthProvider> = {
    google: new GoogleProvider(),
    github: new GithubProvider(),
    spotify: new SpotifyProvider(),
    twitch: new TwitchProvider(),
  };

  static getProvider(providerName: string): IOAuthProvider {
    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(`Provider ${providerName} not supported`);
    }
    return provider;
  }
}