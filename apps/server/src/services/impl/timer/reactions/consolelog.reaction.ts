import { IReaction } from '../../../../interfaces/service.interface';
import { UserWithAccounts } from '../../../../types/user.types';

interface ConsoleLogParams {
  message: string;
}

export const ConsoleLogReaction: IReaction<ConsoleLogParams> = {
  id: 'TIMER_LOG',
  name: 'Console Log',
  description: 'Logs a message to the server console.',
  parameters: [
    { name: 'message', description: 'Text to log', type: 'string', required: true }
  ],
  execute: async (_user: UserWithAccounts, params: ConsoleLogParams, _actionData: any) => {
    console.log(`[AREA LOG] ${params.message}`);
  }
};
