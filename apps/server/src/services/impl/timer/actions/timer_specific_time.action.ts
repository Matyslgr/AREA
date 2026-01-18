import { IAction } from '../../../../interfaces/service.interface';
import { UserWithAccounts } from '../../../../types/user.types';

interface SpecificTimeParams {
  hour: number;
  minute: number;
}

interface SpecificTimeState {
  lastTriggeredDate: string;
}

export const TimerSpecificTimeAction: IAction<SpecificTimeParams, SpecificTimeState> = {
  id: 'TIMER_AT_SPECIFIC_TIME',
  name: 'At a specific time',
  description: 'Triggers once a day at the specified hour and minute.',

  parameters: [
    { name: 'hour', description: 'Hour (0-23)', type: 'number', required: true },
    { name: 'minute', description: 'Minute (0-59)', type: 'number', required: true }
  ],

  return_values: [
    { name: 'executed_at', description: 'Full timestamp of execution' },
    { name: 'date', description: 'Date of execution (YYYY-MM-DD)' },
    { name: 'time', description: 'Time of execution (HH:mm)' }
  ],

  state: {
    lastTriggeredDate: ''
  },

  scopes: [],

  check: async (user: UserWithAccounts, params: SpecificTimeParams, previousState?: SpecificTimeState) => {
    const now = new Date();
    const todayStr = now.toLocaleDateString('en-CA'); // YYYY-MM-DD

    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const targetMinutes = Number(params.hour) * 60 + Number(params.minute);

    const TOLERANCE_WINDOW = 30;

    const isTimeReached = currentMinutes >= targetMinutes;
    const isWithinTolerance = currentMinutes < (targetMinutes + TOLERANCE_WINDOW);

    if (!isTimeReached || !isWithinTolerance) {
      return null;
    }

    const lastRun = previousState?.lastTriggeredDate;

    if (lastRun === todayStr) {
      return null;
    }

    return {
      save: {
        lastTriggeredDate: todayStr
      },
      data: {
        executed_at: now.toISOString(),
        date: todayStr,
        time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      }
    };
  }
};