// verifies if a URL belongs to github.com
export const  is_github_url = (url: string): boolean => {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.)?github\.com(\/|$)/;
  return regex.test(url);
}

// parses the GitHub issue ID from a GitHub URL
export const  extract_github_issue_id_from_url = (url: string): string | null => {
  const match = url.match(/^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)\/issues\/(\d+)$/);
  return match ? match[3] : null;
};

// parses the GitHub owner from a GitHub URL
export const  extract_github_owner_from_url = (url: string): string | null => {
  const match = url.match(/^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)\/issues\/(\d+)$/);
  return match ? match[1] : null;
};

// parses the GitHub repo name from a GitHub URL
export const  extract_github_repo_from_url = (url: string): string | null => {
  const match = url.match(/^https?:\/\/(?:www\.)?github\.com\/([\w.-]+)\/([\w.-]+)\/issues\/(\d+)$/);
  return match ? match[2] : null;
};
