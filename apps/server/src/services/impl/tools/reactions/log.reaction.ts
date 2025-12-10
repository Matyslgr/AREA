import { IReaction } from '../../../../interfaces/service.interface';
import { UserWithAccounts } from '../../../../types/user.types';

interface LogParams {
  message: string;
}

export const LogReaction: IReaction<LogParams> = {
  id: 'LOG',
  name: 'Log',
  description: 'Logs a message to the server console.',
  scopes: [],
  parameters: [
    { name: 'message', description: 'Text to log', type: 'string' as const, required: true }
  ],
  execute: async (_user: UserWithAccounts, params: LogParams, _actionData: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[AREA-LOG] [${timestamp}] ${params.message}`);
  }
};
