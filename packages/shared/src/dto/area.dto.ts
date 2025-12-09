export interface AreaDto {
  id: string;
  name: string;
  is_active: boolean;
  user_id: string;
  last_executed_at?: string | null;
  error_log?: string | null;
  action: ActionInstanceDto;
  reactions: ReactionInstanceDto[];
}

export interface ActionInstanceDto {
  name: string;
  parameters: Record<string, any>;
  accountId?: string;
}

export interface ReactionInstanceDto {
  id?: string;
  name: string;
  parameters: Record<string, any>;
  accountId?: string;
}

export interface CreateAreaDto {
  name: string;
  action: {
    name: string;
    parameters: Record<string, any>;
    accountId?: string;
  };
  reactions: {
    name: string;
    parameters: Record<string, any>;
    accountId?: string;
  }[];
}

export interface UpdateAreaDto {
  name?: string;
  is_active?: boolean;
  action?: {
    name?: string;
    parameters: Record<string, any>;
    accountId?: string;
  };
  reactions?: {
    name: string;
    parameters?: Record<string, any>;
    accountId?: string;
  }[];
}
