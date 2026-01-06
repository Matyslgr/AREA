import { AxiosAdapter } from '@area/shared';
import { IAction } from '../../../../interfaces/service.interface';
import { getAccessTokenWithRefresh } from '../../../../utils/token.utils';
import { UserWithAccounts } from '../../../../types/user.types';

interface GithubPushParams {
  owner: string;
  repo: string;
  branch?: string;
}

interface GithubPushState {
  lastCommitSha: string;
}

export const GithubNewPushAction: IAction<GithubPushParams, GithubPushState> = {
  id: 'GITHUB_NEW_PUSH_DETECTED',
  name: 'New Push Detected',
  description: 'Triggers when a new commit is pushed to a specific branch.',

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
    },
    {
      name: 'branch',
      description: 'Branch to monitor (default: main)',
      type: 'string',
      required: false
    }
  ],

  return_values: [
    { name: 'commit_message', description: 'Message of the commit', example: 'Fixed bug in authentication' },
    { name: 'commit_author', description: 'Author username', example: 'octocat' },
    { name: 'commit_sha', description: 'The full hash of the commit', example: '9c1b2f3d4e5f6g7h8i9j0k' },
    { name: 'commit_url', description: 'Link to view the commit on GitHub', example: 'https://github.com/octocat/Hello-World/commit/9c1b2f3d4e5f6g7h8i9j0k' },
    { name: 'branch', description: 'The branch where the push happened', example: 'main' }
  ],

  state: {
    lastCommitSha: ''
  },

  scopes: ['repo'],

  check: async (user: UserWithAccounts, params: GithubPushParams, previousState?: GithubPushState) => {
    try {
      const token = await getAccessTokenWithRefresh(user, 'github');
      const targetBranch = params.branch || 'main';
      const http = new AxiosAdapter();

      // On utilise l'AxiosAdapter ici au lieu d'axios directement
      const url = `https://api.github.com/repos/${params.owner}/${params.repo}/commits`;

      const data = await http.get<any>(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github.v3+json'
        },
        params: {
          sha: targetBranch,
          per_page: 1
        }
      });


      if (!data || data.length === 0) return null;

      const latestCommit = data[0];
      const currentSha = latestCommit.sha;
      const storedSha = previousState?.lastCommitSha;

      if (!storedSha) {
        return {
          save: { lastCommitSha: currentSha },
          data: null
        };
      }

      if (currentSha !== storedSha) {
        return {
          save: { lastCommitSha: currentSha },
          data: {
            commit_message: latestCommit.commit.message,
            commit_author: latestCommit.author?.login || latestCommit.commit.author.name,
            commit_sha: currentSha,
            commit_url: latestCommit.html_url,
            branch: targetBranch
          }
        };
      }

      return null;

    } catch (error) {
      console.error(`Error checking GitHub pushes for ${params.owner}/${params.repo}:`, error);
      return null;
    }
  }
};