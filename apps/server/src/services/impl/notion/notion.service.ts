import { IService } from '../../../interfaces/service.interface';
import { NotionNewItemAction } from './actions/notion_new_item.action';
import { NotionPageUpdatedAction } from './actions/notion_page_updated.action';
import { NotionCreatePageReaction } from './reactions/notion_create_page.reaction';
import { NotionArchivePageReaction } from './reactions/notion_archive_page.reaction';

export const NotionService: IService = {
  id: 'notion',
  name: 'Notion',
  version: '1.0.0',
  description: 'Integration with Notion API.',
  is_oauth: true,
  actions: [
    NotionNewItemAction,
    NotionPageUpdatedAction
  ],
  reactions: [
    NotionCreatePageReaction,
    NotionArchivePageReaction
  ],
};
