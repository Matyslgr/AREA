import { AxiosAdapter } from '@area/shared';
import { IReaction } from '../../../../interfaces/service.interface';
import { getNotionAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface NotionCreatePageParams {
  database_id: string;
  title: string;
  content?: string;
}

export const NotionCreatePageReaction: IReaction<NotionCreatePageParams> = {
  id: 'NOTION_CREATE_PAGE',
  name: 'Create Page in Database',
  description: 'Creates a new item (page) in a specific database.',
  parameters: [
    { name: 'database_id', description: 'Target Database ID', type: 'string', required: true },
    { name: 'title', description: 'The title of the new page', type: 'string', required: true },
    { name: 'content', description: 'Text content inside the page (optional)', type: 'string', required: false }
  ],
  scopes: [],

  execute: async (user: UserWithAccounts, params: NotionCreatePageParams) => {
    const token = getNotionAccessToken(user);
    const http = new AxiosAdapter();

    const headers = {
      Authorization: `Bearer ${token}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json'
    };

    const dbInfo = await http.get<any>(`https://api.notion.com/v1/databases/${params.database_id}`, {
      headers: headers
    });

    const titleKey = Object.keys(dbInfo.properties).find(
      key => dbInfo.properties[key].type === 'title'
    );

    if (!titleKey) {
      throw new Error(`Database ${params.database_id} has no 'title' property. This is unexpected.`);
    }

    const body: any = {
      parent: { database_id: params.database_id },
      properties: {
        [titleKey]: {
          title: [
            {
              text: {
                content: params.title
              }
            }
          ]
        }
      }
    };

    // If there is content, we add it as a paragraph block
    if (params.content) {
      body.children = [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: {
                  content: params.content
                }
              }
            ]
          }
        }
      ];
    }

    await http.post('https://api.notion.com/v1/pages', body, {
      headers: headers
    });
  }
};