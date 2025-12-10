import { IService } from '../../../interfaces/service.interface';
import { LogReaction } from './reactions/log.reaction';
import { HttpReaction } from './reactions/http.reaction';

export const ToolsService: IService = {
  id: 'tools',
  name: 'Tools',
  description: 'Essential utilities for debugging and data manipulation',
  version: '1.0.0',
  is_oauth: false,
  actions: [],
  reactions: [
    LogReaction,
    HttpReaction,
  ],
};
