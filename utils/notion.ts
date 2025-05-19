// verifies if a URL belongs to notion.so
export const is_notion_url = (url: string): boolean => {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.)?notion\.so(\/|$)/;
  return regex.test(url);
}

export const extract_notion_page_from_url = (url: string): string | null => {
  const match = url.match(/^https:\/\/www\.notion\.so\/.+-([a-f0-9]{32})$/i);
  return match ? match[1] : null;
}