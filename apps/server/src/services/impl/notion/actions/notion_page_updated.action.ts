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
      const token = getNotionAccessToken(user);
      const http = new AxiosAdapter();
      const lastTime = previousState?.lastEditedTime || new Date().toISOString();

      const data = await http.post<any>(`https://api.notion.com/v1/databases/${params.database_id}/query`, {
        filter: {
          timestamp: "last_edited_time",
          last_edited_time: {
            after: lastTime
          }
        },
        sorts: [{ timestamp: "last_edited_time", direction: "descending" }]
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Notion-Version': '2022-06-28'
        }
      });

      const results = data.results;

      if (results && results.length > 0) {
        const latest = results[0];

        if (latest.last_edited_time === lastTime) return null;

        let title = 'Untitled';
        if (latest.properties) {
             const titleKey = Object.keys(latest.properties).find(key => latest.properties[key].type === 'title');
             if (titleKey) {
                 const titleObj = latest.properties[titleKey].title;
                 if (titleObj.length > 0) title = titleObj[0].plain_text;
             }
        }

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
      return null;
    } catch (e) {
      return null;
    }
  }
};