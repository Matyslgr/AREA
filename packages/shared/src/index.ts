export interface AreaDto {
  id: string;
  name: string;
  is_active: boolean;
  user_id: string;
  last_executed_at?: string | null;
  error_log?: string | null;
  action: ActionDto;
  reactions: ReactionDto[];
}

export interface ActionDto {
  name: string;
  parameters: Record<string, any>;
}

export interface ReactionDto {
  name: string;
  parameters: Record<string, any>;
}

export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  actions: ServiceActionDto[];
  reactions: ServiceReactionDto[];
}

export interface ServiceActionDto {
  id: string;
  name: string;
  description: string;
  parameters: ParameterDto[];
}

export interface ServiceReactionDto {
  id: string;
  name: string;
  description: string;
  parameters: ParameterDto[];
}

export interface ParameterDto {
  name: string;
  description: string;
  type: string;
  required: boolean;
}

export * from './interfaces/http.interface';
export * from './adapters/axios.adapter';