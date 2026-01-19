import type { Activity } from '../services/roomService';

export interface GroupedActivity {
  date: string;
  displayDate: string;
  activities: Activity[];
  counts: {
    total: number;
    buys: number;
    sells: number;
    redeems: number;
  };
}

/**
 * Groups activities by date (in UTC, matching Polymarket behavior)
 * and calculates statistics for each group.
 */
export function groupActivities(activities: Activity[]): GroupedActivity[] {
  if (!activities.length) return [];

  const groups = new Map<string, GroupedActivity>();

  for (const activity of activities) {
    // Use UTC date to match how Polymarket displays timestamps
    const date = new Date(activity.timestamp);
    const dateKey = date.toISOString().split('T')[0]; // YYYY-MM-DD in UTC

    if (!groups.has(dateKey)) {
      groups.set(dateKey, {
        date: dateKey,
        displayDate: formatDisplayDate(date),
        activities: [],
        counts: { total: 0, buys: 0, sells: 0, redeems: 0 },
      });
    }

    const group = groups.get(dateKey)!;
    group.activities.push(activity);
    group.counts.total++;

    switch (activity.type) {
      case 'buy':
        group.counts.buys++;
        break;
      case 'sell':
        group.counts.sells++;
        break;
      case 'redeem':
        group.counts.redeems++;
        break;
    }
  }

  // Convert to array and sort by date descending
  return Array.from(groups.values()).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

/**
 * Formats a date for display in a human-readable format.
 */
function formatDisplayDate(date: Date): string {
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const activityDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));

  const diffTime = today.getTime() - activityDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';

  // Return formatted date like "Jan 15, 2025"
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

/**
 * Validates and transforms activity data from API response.
 * Filters out invalid activities and ensures required fields exist.
 */
export function validateActivities(data: unknown[]): Activity[] {
  return data.filter((item): item is Activity => {
    if (!item || typeof item !== 'object') return false;
    const activity = item as Partial<Activity>;
    return (
      typeof activity.address === 'string' &&
      typeof activity.type === 'string' &&
      ['buy', 'sell', 'redeem', 'split', 'merge', 'reward', 'conversion', 'maker_rebate'].includes(activity.type) &&
      typeof activity.market === 'string' &&
      typeof activity.amount === 'number' &&
      typeof activity.timestamp === 'string'
    );
  });
}

/**
 * Sorts activities by timestamp (newest first).
 */
export function sortActivitiesByDate(activities: Activity[]): Activity[] {
  return [...activities].sort((a, b) =>
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/**
 * Deduplicates activities based on address, type, market, and timestamp.
 */
export function deduplicateActivities(activities: Activity[]): Activity[] {
  const seen = new Set<string>();
  return activities.filter((activity) => {
    if (!activity?.address || !activity?.type || !activity?.market || !activity?.timestamp) {
      return false; // Skip invalid activities
    }
    const key = `${activity.address}-${activity.type}-${activity.market}-${activity.timestamp}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
