// verifies if a URL belongs to miro.com
export const  is_miro_url = (url: string): boolean => {
  const regex = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.)?miro\.com(\/|$)/;
  return regex.test(url);
}

// parses the Miro board ID from a Miro URL
export const  extract_miro_board_id_from_url = (url: string): string | null => {
  const regex = /miro\.com\/app\/board\/([\w-=]+)\/?/;
  const match = url.match(regex);
  return match ? match[1] : null;
}