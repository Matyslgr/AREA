import { serviceManager } from './service.manager';
import { TimerService } from './impl/timer/timer.service';
import { ToolsService } from './impl/tools/tools.service';
import { GoogleService } from './impl/google/google.service';
import { GithubService } from './impl/github/github.service';
import { LinkedInService } from './impl/linkedin/linkedin.service';
import { NotionService } from './impl/notion/notion.service';
import { SpotifyService } from './impl/spotify/spotify.service';
import { TwitchService } from './impl/twitch/twitch.service';
// Import other services here...

export const registerServices = () => {
  serviceManager.register(TimerService);
  serviceManager.register(GoogleService);
  serviceManager.register(ToolsService);
  serviceManager.register(GithubService);
  serviceManager.register(LinkedInService);
  serviceManager.register(NotionService);
  serviceManager.register(SpotifyService);
  serviceManager.register(TwitchService);
  // Register other services here...
  console.log('✅ [ServiceManager] All services registered');
};
