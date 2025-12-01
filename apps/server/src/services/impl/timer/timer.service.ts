import { User } from '@prisma/client';
import { IService, IAction, IReaction } from '../../../../interfaces/service.interface';

interface TimerActionParams {
  interval: number;
}

interface TimerState {
  lastTrigger: number;
  date?: string;
  time?: string;
}

interface ConsoleLogParams {
  message: string;
}

const EveryXMinutesAction: IAction<TimerActionParams, TimerState> = {
  id: 'TIMER_EVERY_X_MINUTES',
  name: 'Every X Minutes',
  description: 'Triggers every X minutes.',
  parameters: [
    { name: 'interval', description: 'Interval (min)', type: 'number', required: true }
  ],
  check: async (_user: User, params: TimerActionParams, previousState: TimerState) => {
    const interval = params.interval || 1; // Default 1 min
    const now = Date.now();
    const lastTrigger = previousState?.lastTrigger || 0;

    const intervalMs = (interval < 1 ? interval * 60 : interval * 60) * 1000;

    if (now - lastTrigger >= intervalMs) {
      return {
        lastTrigger: now,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString(),
      };
    }
    return null;
  }
};

const ConsoleLogReaction: IReaction<ConsoleLogParams> = {
  id: 'TIMER_LOG',
  name: 'Console Log',
  description: 'Logs a message to the server console.',
  parameters: [
    { name: 'message', description: 'Text to log', type: 'string', required: true }
  ],
  execute: async (_user: User, params: ConsoleLogParams, _actionData: any) => {
    console.log(`[AREA LOG] ${params.message}`);
  }
};

export const TimerService: IService = {
  id: 'timer',
  name: 'Timer',
  version: '1.0.0',
  description: 'Internal time-based scheduler.',
  actions: [EveryXMinutesAction as IAction],
  reactions: [ConsoleLogReaction as IReaction],
};
