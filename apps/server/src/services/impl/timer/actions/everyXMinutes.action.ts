import { UserWithAccounts } from '../../../../types/user.types';
import { IAction } from '../../../../interfaces/service.interface';

interface TimerActionParams {
  interval: number;
}

interface TimerState {
  lastTrigger: number;
  date?: string;
  time?: string;
}

export const EveryXMinutesAction: IAction<TimerActionParams, TimerState> = {
  id: 'TIMER_EVERY_X_MINUTES',
  name: 'Every X Minutes',
  description: 'Triggers every X minutes.',
  parameters: [
    { name: 'interval', description: 'Interval (min)', type: 'number', required: true }
  ],
  return_values: [
    { name: 'date', description: 'Date of the trigger', example: '2024-04-27' },
    { name: 'time', description: 'Time of the trigger', example: '14:30:00' },
    { name: 'timestamp', description: 'Timestamp of the trigger', example: '1714411800000' }
  ],
  state: {
    lastTrigger: 0
  },
  check: async (_user: UserWithAccounts, params: TimerActionParams, previousState?: TimerState) => {
    const interval = params.interval || 1; // Default 1 min
    const now = Date.now();
    const lastTrigger = previousState?.lastTrigger || 0;

    const intervalMs = interval * 60 * 1000;

    if (now - lastTrigger >= intervalMs) {
      const triggerData = {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
        timestamp: now
      };
      return {
        save: {
          lastTrigger: now,
        },
        data: triggerData
      };
    }
    return null;
  }
};
