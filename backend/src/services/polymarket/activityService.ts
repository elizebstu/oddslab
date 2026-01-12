import axios from 'axios';
import { CacheMap } from './cache';
import { POLYMARKET_DATA_API, CACHE_TTL } from './constants';
import { fetchPolymarketProfile } from './profileService';
import type { Activity, PolymarketActivity } from './types';

// Cache for activities
const activityCache = new CacheMap<Activity[]>(CACHE_TTL);

/**
 * Fetch trading activities for addresses using Polymarket Data API
 */
export const fetchPolymarketActivities = async (addresses: string[]): Promise<Activity[]> => {
  const cacheKey = addresses.sort().join(',');

  const cached = activityCache.get(cacheKey);
  if (cached !== null) {
    return cached;
  }

  try {
    const allActivities: Activity[] = [];
    const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);

    // Fetch user profiles for all addresses in parallel
    const profilePromises = addresses.map((addr) => fetchPolymarketProfile(addr));
    const profiles = await Promise.all(profilePromises);
    const profileMap = new Map<string, string | undefined>();
    addresses.forEach((addr, idx) => {
      const profile = profiles[idx];
      const displayName = profile?.name || profile?.username;
      if (displayName) {
        profileMap.set(addr.toLowerCase(), displayName);
      }
    });

    for (const address of addresses) {
      try {
        // Use /activity endpoint instead of /trades
        const response = await axios.get<PolymarketActivity[]>(`${POLYMARKET_DATA_API}/activity`, {
          params: {
            user: address.toLowerCase(),
            limit: 500,
          },
          timeout: 15000,
        });

        if (response.data && Array.isArray(response.data)) {
          const activities = response.data;

          // Filter activities from last 24 hours
          const recentActivities = activities.filter((activity) => activity.timestamp >= oneDayAgo);

          const mappedActivities = recentActivities.map((activity) => {
            // Determine type based on activity type and side
            let type: Activity['type'];

            if (activity.type === 'TRADE' && activity.side) {
              type = activity.side === 'BUY' ? 'buy' : 'sell';
            } else if (activity.type === 'REDEEM') {
              type = 'redeem';
            } else if (activity.type === 'SPLIT') {
              type = 'split';
            } else if (activity.type === 'MERGE') {
              type = 'merge';
            } else if (activity.type === 'REWARD') {
              type = 'reward';
            } else if (activity.type === 'CONVERSION') {
              type = 'conversion';
            } else if (activity.type === 'MAKER_REBATE') {
              type = 'maker_rebate';
            } else {
              type = 'buy'; // fallback
            }

            return {
              address,
              type,
              market: activity.title || activity.conditionId,
              amount: Math.round(activity.usdcSize * 100) / 100, // Use usdcSize directly
              timestamp: new Date(activity.timestamp * 1000).toISOString(),
              userName: profileMap.get(address.toLowerCase()),
              outcome: activity.outcome,
              icon: activity.icon,
              transactionHash: activity.transactionHash,
            } as Activity;
          });

          allActivities.push(...mappedActivities);
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching activities for address ${address}:`, message);
      }
    }

    const sortedActivities = allActivities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit to 100 most recent activities
    const limitedActivities = sortedActivities.slice(0, 100);

    activityCache.set(cacheKey, limitedActivities);
    return limitedActivities;
  } catch (error) {
    console.error('Error fetching Polymarket activities:', error);
    return [];
  }
};
