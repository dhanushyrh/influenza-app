// Engagement calculation — single source of truth on the app side.
// Mirrors the DB trigger set_engagement_rate() in db/schema.sql.

export function engagementRate(
  avgLikes: number,
  avgComments: number,
  followers: number
): number {
  if (!followers) return 0;
  return Math.round(((avgLikes + avgComments) / followers) * 100 * 100) / 100;
}

export function formatCount(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}
