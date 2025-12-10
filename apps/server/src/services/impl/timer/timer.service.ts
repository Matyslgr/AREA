import { IService } from "../../../interfaces/service.interface";
import { EveryXMinutesAction } from "./actions/everyXMinutes.action";

export const TimerService: IService = {
  id: 'timer',
  name: 'Timer',
  version: '1.0.0',
  description: 'Internal time-based scheduler.',
  is_oauth: false,
  actions: [
    EveryXMinutesAction
  ],
  reactions: [],
};
