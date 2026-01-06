import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessToken } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface GithubStarParams {
  owner: string;
  repo: string;
}

interface GithubStarState {
  lastCount: number;
}

export const GithubNewStarAction: IAction<GithubStarParams, GithubStarState> = {
  id: 'GITHUB_NEW_STAR',
  name: 'New Repository Star',
  description: 'Triggers when a repository receives a new star.',
  parameters: [
    { name: 'owner', description: 'Repository Owner (username)', type: 'string', required: true },
    { name: 'repo', description: 'Repository Name', type: 'string', required: true }
  ],
  state: { lastCount: 0 },
  return_values: [
    { name: 'repo', description: 'Repository Name', example: 'my-repo'},
    { name: 'owner', description: 'Repository Owner', example: 'octocat'},
    { name: 'stars', description: 'Current Star Count', example: '42' },
    { name: 'link', description: 'Link to the Repository', example: 'https://github.com/octocat/my-repo' }
  ],
  scopes: ['repo'],

  check: async (user: UserWithAccounts, params: GithubStarParams, previousState?: GithubStarState) => {
    try {
      const token = getAccessToken(user, 'github');
      const http = new AxiosAdapter();
      const url = `https://api.github.com/repos/${params.owner}/${params.repo}`;

      const repoData = await http.get<any>(url, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const currentCount = repoData.stargazers_count;
      const storedCount = previousState?.lastCount || 0;

      // First run initialization
      if (previousState === undefined) {
         return { save: { lastCount: currentCount }, data: null };
      }

      if (currentCount > storedCount) {
        return {
          save: { lastCount: currentCount },
          data: {
            repo: params.repo,
            owner: params.owner,
            stars: currentCount,
            link: repoData.html_url
          }
        };
      }

      // Update state if stars decreased to prevent re-triggering
      if (currentCount < storedCount) {
         return { save: { lastCount: currentCount }, data: null };
      }

      return null;
    } catch (error) {
      console.error('Github Action Error:', error);
      return null;
    }
  }
};