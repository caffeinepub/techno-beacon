export type TicketPlatform = 'dice' | 'songkick';

export function buildTicketSearchUrl(platform: TicketPlatform, artistName: string): string {
  const encoded = encodeURIComponent(artistName);
  if (platform === 'dice') {
    return `https://dice.fm/search?q=${encoded}`;
  }
  return `https://www.songkick.com/search?query=${encoded}`;
}
