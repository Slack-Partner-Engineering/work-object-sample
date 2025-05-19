// verifies if a URL belongs to github.com
export const is_pagerduty_url = (url: string): boolean => {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.)?pagerduty\.com(\/|$)/;
  return regex.test(url);
}

export const extract_pagerduty_incident_from_url = (url: string): string | null => {
  const match = url.match(/\/incidents\/([A-Z0-9]+)$/);
  return match ? match[1] : null;
}