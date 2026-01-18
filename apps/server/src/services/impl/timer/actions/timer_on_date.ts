import { IAction } from '../../../../interfaces/service.interface';
import { UserWithAccounts } from '../../../../types/user.types';

interface OnDateParams {
  iso_date: string;
}

interface OnDateState {
  executed: boolean;
}

export const TimerOnDateAction: IAction<OnDateParams, OnDateState> = {
  id: 'TIMER_ON_DATE',
  name: 'On Specific Date',
  description: 'Triggers exactly once when a specific date and time is reached.',
  parameters: [
    { name: 'iso_date', description: 'Date (ISO 8601)', type: 'string', required: true }
  ],
  return_values: [],
  state: { executed: false },
  scopes: [],

  check: async (_user: UserWithAccounts, params: OnDateParams, previousState?: OnDateState) => {
    if (previousState?.executed) return null;

    const targetDate = new Date(params.iso_date).getTime();
    const now = Date.now();

    if (now >= targetDate) {
      return {
        save: { executed: true },
        data: { date: params.iso_date }
      };
    }

    return null;
  }
};
