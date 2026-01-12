import axios from 'axios';
import { CacheMap } from './cache';
import { POLYMARKET_DATA_API, CACHE_TTL } from './constants';
import { fetchPolymarketProfile } from './profileService';
import type { Activity, PolymarketTrade } from './types';

// Cache for activities
const activityCache = new CacheMap<Activity[]>(CACHE_TTL);

/**
 * Fetch trading activities for addresses
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
        const response = await axios.get<PolymarketTrade[]>(`${POLYMARKET_DATA_API}/trades`, {
          params: {
            user: address.toLowerCase(),
            limit: 500,
          },
          timeout: 15000,
        });

        if (response.data && Array.isArray(response.data)) {
          const trades = response.data;

          // Filter trades from last 24 hours
          const recentTrades = trades.filter((trade) => trade.timestamp >= oneDayAgo);

          const activities = recentTrades.map((trade) => {
            const type: 'buy' | 'sell' = trade.side === 'BUY' ? 'buy' : 'sell';
            const amount = trade.size * trade.price;

            return {
              address,
              type,
              market: trade.title || trade.conditionId,
              amount: Math.round(amount * 100) / 100,
              timestamp: new Date(trade.timestamp * 1000).toISOString(),
              userName: profileMap.get(address.toLowerCase()),
            } as Activity;
          });

          allActivities.push(...activities);
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
