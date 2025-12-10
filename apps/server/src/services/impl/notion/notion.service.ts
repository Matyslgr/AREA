import { IService } from '../../../interfaces/service.interface';
import { NotionNewItemAction } from './actions/notion_new_item.action';

export const NotionService: IService = {
  id: 'notion',
  name: 'Notion',
  version: '1.0.0',
  description: 'Integration with Notion API.',
  is_oauth: true,
  actions: [
    NotionNewItemAction
  ],
  reactions: [],
};
