import type { Activity, Position } from '../services/polymarketDirect';

export interface ActivityGroup {
  key: string;
  activities: Activity[];
  latestActivity: Activity;
  totalBuyAmount: number;
  totalSellAmount: number;
  buyCount: number;
  sellCount: number;
  positionValue: number | null;
  profitLoss: number | null;
}

/**
 * Groups activities by market and address with aggregated statistics.
 * Pure function optimized for memoization.
 */
export function groupActivities(activities: Activity[], positions: Position[]): ActivityGroup[] {
  if (!activities.length) return [];

  // Create a position map for O(1) lookups (js-index-maps rule)
  const positionMap = new Map<string, number>();
  for (const pos of positions) {
    const key = `${pos.market}_${pos.address}`;
    positionMap.set(key, pos.totalValue);
  }

  // Group activities by market and address
  const groupsMap = new Map<string, ActivityGroup>();

  for (const activity of activities) {
    const key = `${activity.market}_${activity.address}`;

    if (!groupsMap.has(key)) {
      groupsMap.set(key, {
        key,
        activities: [],
        latestActivity: activity,
        totalBuyAmount: 0,
        totalSellAmount: 0,
        buyCount: 0,
        sellCount: 0,
        positionValue: null,
        profitLoss: null,
      });
    }

    const group = groupsMap.get(key)!;

    // Update with latest activity
    const latestTime = new Date(group.latestActivity.timestamp).getTime();
    const currentTime = new Date(activity.timestamp).getTime();
    if (currentTime > latestTime) {
      group.latestActivity = activity;
    }

    group.activities.push(activity);

    // Aggregate amounts and counts
    if (activity.type === 'buy') {
      group.totalBuyAmount += activity.amount;
      group.buyCount++;
    } else if (activity.type === 'sell') {
      group.totalSellAmount += activity.amount;
      group.sellCount++;
    }
  }

  // Calculate position values and PnL for each group
  for (const [key, group] of groupsMap) {
    const positionValue = positionMap.get(key);
    if (positionValue !== undefined) {
      group.positionValue = positionValue;
      // Calculate PnL: (current position value - total buy + total sell)
      // Simplified calculation for display purposes
      group.profitLoss = positionValue - group.totalBuyAmount + group.totalSellAmount;
    }
  }

  // Convert to array and sort by latest activity time
  return Array.from(groupsMap.values()).sort((a, b) => {
    const aTime = new Date(a.latestActivity.timestamp).getTime();
    const bTime = new Date(b.latestActivity.timestamp).getTime();
    return bTime - aTime;
  });
}

/**
 * Filters groups by volume range.
 */
export function filterGroupsByVolume(
  groups: ActivityGroup[],
  minVolume?: number,
  maxVolume?: number
): ActivityGroup[] {
  const min = minVolume ?? 0;
  const max = maxVolume ?? Infinity;

  return groups.filter((group) => {
    const total = group.totalBuyAmount + group.totalSellAmount;
    return total >= min && total <= max;
  });
}
