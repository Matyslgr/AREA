import { AxiosAdapter } from '@area/shared';
import { IReaction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface GithubIssueParams {
  owner: string;
  repo: string;
  title: string;
  body: string;
}

export const GithubCreateIssueReaction: IReaction<GithubIssueParams> = {
  id: 'GITHUB_CREATE_ISSUE',
  name: 'Create GitHub Issue',
  description: 'Opens a new issue on a specific repository.',
  parameters: [
    { name: 'owner', description: 'Repo Owner', type: 'string', required: true },
    { name: 'repo', description: 'Repo Name', type: 'string', required: true },
    { name: 'title', description: 'Issue Title', type: 'string', required: true },
    { name: 'body', description: 'Issue Content', type: 'string', required: true }
  ],
  scopes: ['repo'],

  execute: async (user: UserWithAccounts, params: GithubIssueParams) => {
    const token = getAccessToken(user, 'github');
    const http = new AxiosAdapter();
    const url = `https://api.github.com/repos/${params.owner}/${params.repo}/issues`;

    await http.post(url, {
      title: params.title,
      body: params.body
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
  }
};