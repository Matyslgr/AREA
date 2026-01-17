import { AxiosAdapter } from '@area/shared';
import { IReaction } from '../../../../interfaces/service.interface';
import { getNotionAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface NotionArchiveParams {
  page_id: string;
}

export const NotionArchivePageReaction: IReaction<NotionArchiveParams> = {
  id: 'NOTION_ARCHIVE_PAGE',
  name: 'Archive Database Page',
  description: 'Archives a page from a Notion database (does not work with workspace-level pages).',
  parameters: [
    { name: 'page_id', description: 'ID of the database page to archive', type: 'string', required: true }
  ],
  scopes: [],

  execute: async (user: UserWithAccounts, params: NotionArchiveParams) => {
    const token = getNotionAccessToken(user);
    const http = new AxiosAdapter();

    await http.patch(`https://api.notion.com/v1/pages/${params.page_id}`,
      { archived: true },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28',
          'Content-Type': 'application/json'
        }
      }
    );
  }
};