import { serviceManager } from './service.manager';
import { TimerService } from './impl/timer/timer.service';
import { GoogleService } from './impl/google/google.service';
// Import other services here...

export const registerServices = () => {
  serviceManager.register(TimerService);
  serviceManager.register(GoogleService);
  console.log('✅ [ServiceManager] All services registered');
};
