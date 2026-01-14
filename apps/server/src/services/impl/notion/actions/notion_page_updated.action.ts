import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getNotionAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface NotionUpdateParams {
  database_id: string;
}

interface NotionUpdateState {
  lastEditedTime: string;
}

export const NotionPageUpdatedAction: IAction<NotionUpdateParams, NotionUpdateState> = {
  id: 'NOTION_PAGE_UPDATED',
  name: 'Page Updated',
  description: 'Triggers when a page in a database is edited.',
  parameters: [
    { name: 'database_id', description: 'Database ID', type: 'string', required: true }
  ],
  state: { lastEditedTime: new Date().toISOString() },
  return_values: [
    { name: 'id', description: 'Page ID', example: '12345' },
    { name: 'url', description: 'Page URL', example: 'https://notion.so/...' },
    { name: 'title', description: 'Page Title', example: 'Meeting Notes' },
    { name: 'editor', description: 'User who edited', example: 'John Doe' }
  ],
  scopes: [],

  check: async (user: UserWithAccounts, params: NotionUpdateParams, previousState?: NotionUpdateState) => {
    try {
      console.log('[Notion] Checking for updated pages in database:', params.database_id);
      const token = getNotionAccessToken(user);
      const http = new AxiosAdapter();
      const isFirstRun = !previousState;
      const lastTime = previousState?.lastEditedTime;
      console.log('[Notion] Is first run:', isFirstRun, 'Last edited time:', lastTime);

      const queryBody: any = {
        sorts: [{ timestamp: "last_edited_time", direction: "descending" }]
      };

      if (lastTime) {
        queryBody.filter = {
          timestamp: "last_edited_time",
          last_edited_time: {
            after: lastTime
          }
        };
        console.log('[Notion] Using filter for edits after:', lastTime);
      } else {
        console.log('[Notion] First run - fetching all pages to establish baseline');
      }

      const data = await http.post<any>(`https://api.notion.com/v1/databases/${params.database_id}/query`, queryBody, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28'
        }
      });

      console.log('[Notion] Query response:', data.results?.length || 0, 'items');
      if (data.results && data.results.length > 0) {
        console.log('[Notion] Latest item edited at:', data.results[0].last_edited_time);
      }
      if (data.object === 'error') {
        console.error('[Notion] API Error:', data);
      }
      const results = data.results;

      if (results && results.length > 0) {
        const latest = results[0];

        if (isFirstRun) {
          console.log('[Notion] First run - establishing baseline with latest edit time:', latest.last_edited_time);
          return {
            save: { lastEditedTime: latest.last_edited_time },
            data: null
          };
        }

        if (latest.last_edited_time === lastTime) {
          console.log('[Notion] No new changes (same timestamp)');
          return null;
        }

        let title = 'Untitled';
        if (latest.properties) {
             const titleKey = Object.keys(latest.properties).find(key => latest.properties[key].type === 'title');
             if (titleKey) {
                 const titleObj = latest.properties[titleKey].title;
                 if (titleObj.length > 0) title = titleObj[0].plain_text;
             }
        }

        console.log('[Notion] Page updated detected:', latest.id);
        return {
          save: { lastEditedTime: latest.last_edited_time },
          data: {
            id: latest.id,
            url: latest.url,
            title: title,
            editor: latest.last_edited_by?.id || 'Unknown'
          }
        };
      }
      console.log('[Notion] No updated pages found');
      return null;
    } catch (e) {
      console.error('[Notion] Error in check:', e);
      return null;
    }
  }
};