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
      console.log('[Notion] Checking for new items in database:', params.database_id);
      const token = getNotionAccessToken(user);
      const http = new AxiosAdapter();
      const isFirstRun = !previousState;
      const lastTime = previousState?.lastCreatedTime;
      console.log('[Notion] Is first run:', isFirstRun, 'Last created time:', lastTime);

      const queryBody: any = {
        sorts: [{ timestamp: "created_time", direction: "descending" }]
      };

      if (lastTime) {
        queryBody.filter = {
          timestamp: "created_time",
          created_time: {
            after: lastTime
          }
        };
        console.log('[Notion] Using filter for items created after:', lastTime);
      } else {
        console.log('[Notion] First run - fetching all items to establish baseline');
      }

      const response = await http.post<any>(`https://api.notion.com/v1/databases/${params.database_id}/query`, queryBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28'
        }
      });

      console.log('[Notion] Query response:', response.results?.length || 0, 'items');
      const results = response.results;
      if (results && results.length > 0) {
        const latest = results[0];

        if (isFirstRun) {
          console.log('[Notion] First run - establishing baseline with latest creation time:', latest.created_time);
          return {
            save: { lastCreatedTime: latest.created_time },
            data: null
          };
        }

        console.log('[Notion] New item detected:', latest.id);
        return {
          save: { lastCreatedTime: latest.created_time },
          data: {
            id: latest.id,
            url: latest.url,
            title: latest.properties?.title?.title[0]?.plain_text || 'No Title'
          }
        };
      }
      console.log('[Notion] No new items found');
      return null;
    } catch (e) {
      console.error('[Notion] Error in check:', e);
      return null;
    }
  }
};
