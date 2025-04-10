import axios from 'axios';

const GITHUB_BASE_URL = "https://api.github.com";

// https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#get-an-issue
export const get_github_issue = async (owner, repo, issue_id) => {
  const getGitHubIssueURL = `${GITHUB_BASE_URL}/repos/${owner}/${repo}/issues/${issue_id}`;

  try {
    const response = await axios.get(getGitHubIssueURL, {
      headers: {
        Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        Accept: 'application/vnd.github+json',
        "X-GitHub-Api-Version": "2022-11-28"
      },
    });
    
    return response.data;
  } catch (error) {
    console.error('Error fetching GitHub issue:', error.response);
    throw error;
  }
};