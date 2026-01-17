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

    // Notion is tricky: we need to map the "title" to the correct property name.
    // By default, in 99% of databases, the primary key is named "Name".
    // A robust solution would fetch the schema first, but for MVP we assume "Name".

    const body: any = {
      parent: { database_id: params.database_id },
      properties: {
        "Name": { // Assumes the title column is named "Name"
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
      headers: {
        Authorization: `Bearer ${token}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json'
      }
    });
  }
};