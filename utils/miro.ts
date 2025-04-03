// parses the Miro board ID from a Miro URL
export const  extract_miro_board_id = (url: string): string | null => {
  const regex = /miro\.com\/app\/board\/([\w-=]+)\/?/;
  const match = url.match(regex);
  return match ? match[1] : null;
}