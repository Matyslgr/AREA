export interface ServiceDto {
  id: string;
  name: string;
  description: string;
  version?: string;
  is_oauth: boolean;
  actions: ServiceActionDto[];
  reactions: ServiceReactionDto[];
}

export interface ServiceActionValueDto {
    name: string;
    description: string;
    example?: string;
}

export interface ServiceActionDto {
  id: string;
  name: string;
  description: string;
  parameters: ParameterDto[];
  scopes?: string[];
  return_values?: ServiceActionValueDto[];
}

export interface ServiceReactionDto {
  id: string;
  name: string;
  description: string;
  parameters: ParameterDto[];
  scopes?: string[];
}

export interface ParameterDto {
  name: string;
  description: string;
  type: string; // 'string' | 'number' | 'boolean' | 'select'
  required: boolean;
  options?: string[]; // For 'select' type
}
