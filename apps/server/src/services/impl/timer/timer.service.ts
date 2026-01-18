import { IService } from "../../../interfaces/service.interface";
import { EveryXMinutesAction } from "./actions/everyXMinutes.action";
import { TimerSpecificTimeAction } from "./actions/timer_specific_time.action";
import { TimerOnDateAction } from "./actions/timer_on_date";
import { TimerCronAction } from "./actions/timer_cron_action";

export const TimerService: IService = {
  id: 'timer',
  name: 'Timer',
  version: '1.0.0',
  description: 'Internal time-based scheduler.',
  is_oauth: false,
  actions: [
    EveryXMinutesAction,
    TimerSpecificTimeAction,
    TimerOnDateAction,
    TimerCronAction
  ],
  reactions: [],
};
