import { IService, IAction, IReaction } from "../../../interfaces/service.interface";
import { EveryXMinutesAction } from "./actions/everyXMinutes.action";
import { ConsoleLogReaction } from "./reactions/consolelog.reaction";

export const TimerService: IService = {
  id: 'timer',
  name: 'Timer',
  version: '1.0.0',
  description: 'Internal time-based scheduler.',
  actions: [EveryXMinutesAction as IAction],
  reactions: [ConsoleLogReaction as IReaction],
};
