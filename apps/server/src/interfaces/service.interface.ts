import { UserWithAccounts } from '../types/user.types';
export interface Parameter {
  name: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  required: boolean;
  options?: string[]; // If type === 'select'
}

// The Action (The Trigger)
export interface IAction<TParam = any, TState = any> {
  id: string;          // ex: "GITHUB_NEW_ISSUE"
  name: string;        // ex: "New Issue Detected"
  description: string;
  parameters: Parameter[];
  state: any;
  scopes?: string[];

  /**
   * Verification function.
   * @param user The owner of the AREA
   * @param params The action parameters (ex: { repo: "my-repo" })
   * @param previousState The previous state stored for this action
   * @returns null if nothing, or a data object if triggered
   */
  check: (user: UserWithAccounts, params: TParam, previousState?: TState) => Promise<any | null>;
}

// The Reaction (The Executor)
export interface IReaction<TParam = any> {
  id: string;          // ex: "DISCORD_SEND_MSG"
  name: string;
  description: string;
  parameters: Parameter[];
  scopes?: string[];

  /**
   * Execution function.
   * @param user The owner of the AREA
   * @param params The reaction parameters (ex: { channel_id: "123" })
   * @param actionData The data coming from the action (ex: { title: "Bug found" })
   */
  execute: (user: UserWithAccounts, params: TParam, actionData: any) => Promise<void>;
}

// The Service (The Group)
export interface IService {
  id: string;          // ex: "github"
  name: string;        // ex: "GitHub"
  version: string;
  description: string;
  actions: IAction[];
  reactions: IReaction[];
}
