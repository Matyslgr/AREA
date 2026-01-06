import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface GithubPrParams {
  owner: string;
  repo: string;
}

interface GithubPrState {
  lastPrNumber: number;
}

export const GithubNewPullRequestAction: IAction<GithubPrParams, GithubPrState> = {
  id: 'GITHUB_NEW_PR_DETECTED',
  name: 'New Pull Request',
  description: 'Triggers when a new pull request is opened in a repository.',

  parameters: [
    {
      name: 'owner',
      description: 'The username or organization name',
      type: 'string',
      required: true
    },
    {
      name: 'repo',
      description: 'The repository name',
      type: 'string',
      required: true
    }
  ],

  return_values: [
    { name: 'pr_title', description: 'Title of the Pull Request', example: 'Add new feature' },
    { name: 'pr_url', description: 'Link to the PR', example: 'https://github.com/octocat/Hello-World/pull/42' },
    { name: 'pr_author', description: 'Username of the author', example: 'octocat' },
    { name: 'pr_number', description: 'The PR number', example: '42' },
    { name: 'source_branch', description: 'Branch merging from (Head)', example: 'feat/login' },
    { name: 'target_branch', description: 'Branch merging into (Base)', example: 'main' }
  ],

  state: {
    lastPrNumber: 0
  },

  scopes: ['repo'],

  check: async (user: UserWithAccounts, params: GithubPrParams, previousState?: GithubPrState) => {
    try {
      const token = await getAccessTokenWithRefresh(user, 'github');
      const http = new AxiosAdapter();
      const url = `https://api.github.com/repos/${params.owner}/${params.repo}/pulls`;

      const data = await http.get<any>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          state: 'open',
          sort: 'created',
          direction: 'desc',
          per_page: 1
        }
      });

      if (!data || data.length === 0) return null;

      const latestPr = data[0];
      const currentPrNumber = latestPr.number;
      const storedPrNumber = previousState?.lastPrNumber;

      if (!storedPrNumber) {
        return {
          save: { lastPrNumber: currentPrNumber },
          data: null
        };
      }

      if (currentPrNumber > storedPrNumber) {
        return {
          save: { lastPrNumber: currentPrNumber },
          data: {
            pr_title: latestPr.title,
            pr_url: latestPr.html_url,
            pr_author: latestPr.user?.login || 'Unknown',
            pr_number: latestPr.number,
            source_branch: latestPr.head.ref, // ex: feat/login
            target_branch: latestPr.base.ref  // ex: main
          }
        };
      }

      return null;

    } catch (error) {
      console.error(`Error checking GitHub PRs for ${params.owner}/${params.repo}:`, error);
      return null;
    }
  }
};
