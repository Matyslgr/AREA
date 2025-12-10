import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
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
  scopes: [],

  check: async (user: UserWithAccounts, params: NotionParams, previousState?: NotionState) => {
    try {
      const token = getAccessToken(user, 'notion');
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
            title: "New Notion Page"
          }
        };
      }
      return null;
    } catch (e) { return null; }
  }
};
