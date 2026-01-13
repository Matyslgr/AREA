import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getNotionAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface NotionParams {
  database_id: string;
}

interface NotionState {
  lastCreatedTime: string;
}

export const NotionNewItemAction: IAction<NotionParams, NotionState> = {
  id: 'NOTION_NEW_ITEM',
  name: 'New Database Item',
  description: 'Triggers when a new item is added to a database.',
  parameters: [
    { name: 'database_id', description: 'Database ID', type: 'string', required: true }
  ],
  state: { lastCreatedTime: new Date().toISOString() },
  return_values: [
    { name: 'id', description: 'ID of the new item', example: 'some-unique-id' },
    { name: 'url', description: 'URL of the new item', example: 'https://www.notion.so/some-unique-id' },
    { name: 'title', description: 'Title of the new item', example: 'New Notion Page' }
  ],
  scopes: [],

  check: async (user: UserWithAccounts, params: NotionParams, previousState?: NotionState) => {
    try {
      const token = getNotionAccessToken(user);
      const http = new AxiosAdapter();
      const lastTime = previousState?.lastCreatedTime || new Date().toISOString();

      const response = await http.post<any>(`https://api.notion.com/v1/databases/${params.database_id}/query`, {
        filter: {
          timestamp: "created_time",
          created_time: {
            after: lastTime
          }
        },
        sorts: [{ timestamp: "created_time", direction: "descending" }]
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28'
        }
      });

      const results = response.results;
      if (results && results.length > 0) {
        const latest = results[0];
        return {
          save: { lastCreatedTime: latest.created_time },
          data: {
            id: latest.id,
            url: latest.url,
            title: latest.properties?.title?.title[0]?.plain_text || 'No Title'
          }
        };
      }
      return null;
    } catch (e) { return null; }
  }
};
