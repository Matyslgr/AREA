import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface GithubIssueParams {
  owner: string;
  repo: string;
}

interface GithubIssueState {
  lastIssueNumber: number;
}

export const GithubNewIssueAction: IAction<GithubIssueParams, GithubIssueState> = {
  id: 'GITHUB_NEW_ISSUE_DETECTED',
  name: 'New Issue Detected',
  description: 'Triggers when a new issue is created in a specific repository.',

  // Parameters required from the user
  parameters: [
    {
      name: 'owner',
      description: 'The username or organization name (e.g., "facebook")',
      type: 'string',
      required: true
    },
    {
      name: 'repo',
      description: 'The repository name (e.g., "react")',
      type: 'string',
      required: true
    }
  ],

  // Variables available for the Reaction (Interpolation)
  return_values: [
    { name: 'issue_title', description: 'The title of the issue', example: 'Bug in authentication flow' },
    { name: 'issue_url', description: 'Direct link to the issue', example: 'https://github.com/facebook/react/issues/123' },
    { name: 'issue_author', description: 'Username of the creator', example: 'octocat' },
    { name: 'issue_body', description: 'Content description of the issue', example: 'There is a bug in the authentication flow that causes...' },
    { name: 'issue_number', description: 'The unique number of the issue', example: '123' }
  ],

  state: {
    lastIssueNumber: 0
  },

  scopes: ['repo'],

  check: async (user: UserWithAccounts, params: GithubIssueParams, previousState?: GithubIssueState) => {
    try {
      const token = await getAccessTokenWithRefresh(user, 'github');
      const http = new AxiosAdapter();

      const url = `https://api.github.com/repos/${params.owner}/${params.repo}/issues`;
      const data = await http.get<any>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          state: 'open',       // Only look for open issues
          sort: 'created',     // Sort by creation date
          direction: 'desc',   // Newest first
          per_page: 5          // Get a few to be safe, but we mainly need the first real issue
        }
      });


      if (!data || data.length === 0) return null;

      const latestIssue = data.find((issue: any) => !issue.pull_request);

      if (!latestIssue) return null;

      const currentIssueNumber = latestIssue.number;
      const storedIssueNumber = previousState?.lastIssueNumber;

      if (!storedIssueNumber) {
        return {
          save: { lastIssueNumber: currentIssueNumber },
          data: null
        };
      }

      if (currentIssueNumber > storedIssueNumber) {

        return {
          save: { lastIssueNumber: currentIssueNumber },
          data: {
            issue_title: latestIssue.title,
            issue_url: latestIssue.html_url,
            issue_author: latestIssue.user?.login || 'Unknown',
            issue_body: latestIssue.body || '',
            issue_number: latestIssue.number
          }
        };
      }

      return null;

    } catch (error) {
      console.error(`Error checking GitHub issues for ${params.owner}/${params.repo}:`, error);
      return null;
    }
  }
};