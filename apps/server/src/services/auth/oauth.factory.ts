import { IOAuthProvider } from '../../interfaces/auth.interface';
import { GoogleProvider } from './providers/google.provider';
import { GithubProvider } from './providers/github.provider';
import { SpotifyProvider } from './providers/spotify.provider';
import { TwitchProvider } from './providers/twitch.provider';
import { NotionProvider } from './providers/notion.provider';
import { LinkedinProvider } from './providers/linkedin.provider';

export class OAuthFactory {
  private static providers: Record<string, IOAuthProvider> = {
    google: new GoogleProvider(),
    github: new GithubProvider(),
    spotify: new SpotifyProvider(),
    twitch: new TwitchProvider(),
    notion: new NotionProvider(),
    linkedin: new LinkedinProvider(),
  };

  static getProvider(providerName: string): IOAuthProvider {
    const provider = this.providers[providerName];
    if (!provider) {
      throw new Error(`Provider ${providerName} not supported`);
    }
    return provider;
  }
}