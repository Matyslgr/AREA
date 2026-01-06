import { IService } from '../../../interfaces/service.interface';
import { GithubNewStarAction } from './actions/github_new_star.action';
import { GithubNewIssueAction } from './actions/github_new_issue.action';
import { GithubNewPullRequestAction } from './actions/github_new_pr.action';
import { GithubNewPushAction } from './actions/github_new_push.action';
import { GithubCreateIssueReaction } from './reactions/github_create_issue.reaction';

export const GithubService: IService = {
  id: 'github',
  name: 'GitHub',
  version: '1.0.0',
  description: 'Integration with GitHub services.',
  is_oauth: true,
  actions: [
    GithubNewStarAction,
    GithubNewIssueAction,
    GithubNewPullRequestAction,
    GithubNewPushAction
  ],
  reactions: [
    GithubCreateIssueReaction
  ],
};