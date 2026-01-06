import { IAction } from '../../../../interfaces/service.interface';
import { UserWithAccounts } from '../../../../types/user.types';
import { CronAdapter } from '../../../../adapters/cron.adapter';

interface CronParams {
  expression: string; // ex: "0 8 * * 1"
}

interface CronState {
  lastCheckedAt: string;
}

export const TimerCronAction: IAction<CronParams, CronState> = {
  id: 'TIMER_CRON',
  name: 'Cron Schedule',
  description: 'Triggers based on a standard Cron expression (Advanced).',
  parameters: [
    {
      name: 'expression',
      description: 'Cron expression (e.g., "0 8 * * 1" for every Monday at 8am)',
      type: 'string',
      required: true
    }
  ],
  return_values: [
    { name: 'expression', description: 'The executed cron expression', example: '0 8 * * 1' },
    { name: 'date', description: 'Execution date', example: '2024-04-27T08:00:00.000Z' }
  ],
  state: {
    lastCheckedAt: ''
  },
  scopes: [],

  check: async (_user: UserWithAccounts, params: CronParams, previousState?: CronState) => {
    const cleanExpression = params.expression.trim();
    try {
      if (!CronAdapter.isValid(cleanExpression)) {
        console.warn(`[TimerCron] Invalid expression: ${params.expression}`);
        return null;
      }

      const now = new Date();

      if (!previousState?.lastCheckedAt) {
        return {
          save: { lastCheckedAt: now.toISOString() },
          data: null
        };
      }

      const lastCheckedDate = new Date(previousState.lastCheckedAt);

      const nextScheduledDate = CronAdapter.getNextDate(cleanExpression, lastCheckedDate);

      if (!nextScheduledDate) return null;

      if (nextScheduledDate.getTime() <= now.getTime()) {

        if (nextScheduledDate.getTime() > lastCheckedDate.getTime()) {
           return {
             save: { lastCheckedAt: now.toISOString() },
             data: {
               expression: cleanExpression,
               date: nextScheduledDate.toISOString()
             }
           };
        }
      }

      return null;

    } catch (e) {
      console.error("[TimerCron] Unexpected error:", e);
      return null;
    }
  }
};