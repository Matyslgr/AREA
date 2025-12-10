import { IReaction } from '../../../../interfaces/service.interface';
import { AxiosAdapter } from '@area/shared';
import { UserWithAccounts } from '../../../../types/user.types';

interface HttpParams {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: string;
}
export const HttpReaction: IReaction<HttpParams> = {
  id: 'TOOLS_HTTP_REQUEST',
  name: 'HTTP Request (Webhook)',
  description: 'Send a generic HTTP request to any URL using Axios',
  scopes: [],

  parameters: [
    {
      name: 'url',
      description: 'The target URL (e.g. https://api.discord.com/...)',
      required: true,
      type: 'string'
    },
    {
      name: 'method',
      description: 'HTTP Method to use',
      required: true,
      type: 'select',
      options: ['GET', 'POST', 'PUT', 'DELETE']
    },
    {
      name: 'body',
      description: 'JSON Body (only for POST/PUT)',
      required: false,
      type: 'string'
    }
  ],

  /**
   * Execution function.
   */
  execute: async (_user: UserWithAccounts, params: HttpParams, _actionData: any) => {
    const httpClient = new AxiosAdapter();

    const url = params.url;
    const method = params.method || 'GET';
    const bodyStr = params.body || '{}';

    let bodyData: unknown = {};

    if (method === 'POST' || method === 'PUT') {
      try {
        bodyData = JSON.parse(bodyStr);
      } catch (e) {
        console.warn(`[TOOLS] Interpolation broke JSON syntax or invalid JSON. Fallback to raw string.`);
        bodyData = {
            error: "Invalid JSON format after interpolation",
            raw_content: bodyStr
        };
      }
    }

    try {
      console.log(`[TOOLS] Sending ${method} to ${url}`);

      switch (method) {
        case 'GET': await httpClient.get(url); break;
        case 'POST': await httpClient.post(url, bodyData); break;
        case 'PUT': await httpClient.put(url, bodyData); break;
        case 'DELETE': await httpClient.delete(url); break;
      }
    } catch (error: any) {
      // On propage l'erreur pour que l'Engine loggue "Reaction failed"
      throw new Error(`HTTP Request failed: ${error.message}`);
    }
  }
};