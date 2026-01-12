import axios from 'axios';

interface Activity {
  address: string;
  type: 'buy' | 'sell' | 'redeem' | 'split' | 'merge' | 'reward' | 'conversion' | 'maker_rebate';
  market: string;
  amount: number;
  timestamp: string;
  outcome?: string;
  icon?: string;
  transactionHash?: string;
}

interface PolymarketActivity {
  proxyWallet: string;
  timestamp: number;
  conditionId: string;
  type: 'TRADE' | 'SPLIT' | 'MERGE' | 'REDEEM' | 'REWARD' | 'CONVERSION' | 'MAKER_REBATE';
  size: number;
  usdcSize: number;
  transactionHash: string;
  price: number;
  asset: string;
  side?: 'BUY' | 'SELL';
  outcomeIndex: number;
  title: string;
  slug: string;
  icon?: string;
  eventSlug?: string;
  outcome: string;
  name?: string;
  pseudonym?: string;
  bio?: string;
  profileImage?: string;
  profileImageOptimized?: string;
}

const activityCache = new Map<string, { data: Activity[]; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds
const POLYMARKET_DATA_API = 'https://data-api.polymarket.com';

export const fetchPolymarketActivities = async (addresses: string[]): Promise<Activity[]> => {
  const cacheKey = addresses.sort().join(',');
  const cached = activityCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const allActivities: Activity[] = [];
    const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000); // 24 hours ago in seconds

    for (const address of addresses) {
      try {
        // Fetch activity from Polymarket Data API
        const response = await axios.get<PolymarketActivity[]>(`${POLYMARKET_DATA_API}/activity`, {
          params: {
            user: address.toLowerCase(),
            limit: 100,
          },
          timeout: 10000,
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
              market: activity.title,
              amount: Math.round(activity.usdcSize * 100) / 100, // Use usdcSize directly
              timestamp: new Date(activity.timestamp * 1000).toISOString(),
              outcome: activity.outcome,
              icon: activity.icon,
              transactionHash: activity.transactionHash,
            } as Activity;
          });

          allActivities.push(...mappedActivities);
        }
      } catch (error: any) {
        console.error(`Error fetching activities for address ${address}:`, error.message);

        // Log more details for debugging
        if (error.response?.data) {
          console.error('API Response:', JSON.stringify(error.response.data));
        }
      }
    }

    const sortedActivities = allActivities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    activityCache.set(cacheKey, { data: sortedActivities, timestamp: Date.now() });

    return sortedActivities;
  } catch (error) {
    console.error('Error fetching Polymarket activities:', error);
    return [];
  }
};
