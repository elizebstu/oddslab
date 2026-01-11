import axios from 'axios';

interface Activity {
  address: string;
  type: 'buy' | 'sell' | 'redeem';
  market: string;
  amount: number;
  timestamp: string;
}

interface PolymarketTrade {
  proxyWallet: string;
  side: 'BUY' | 'SELL';
  asset: string;
  conditionId: string;
  size: number;
  price: number;
  timestamp: number;
  title: string;
  slug: string;
  outcome: string;
  outcomeIndex: number;
  transactionHash: string;
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
        // Fetch trades from Polymarket Data API
        const response = await axios.get<PolymarketTrade[]>(`${POLYMARKET_DATA_API}/trades`, {
          params: {
            address: address.toLowerCase(),
            limit: 100,
          },
          timeout: 10000,
        });

        if (response.data && Array.isArray(response.data)) {
          const trades = response.data;

          // Filter trades from last 24 hours
          const recentTrades = trades.filter((trade) => trade.timestamp >= oneDayAgo);

          const activities = recentTrades.map((trade) => {
            // Determine type
            const type: 'buy' | 'sell' = trade.side === 'BUY' ? 'buy' : 'sell';

            // Calculate amount in dollars
            const amount = trade.size * trade.price;

            return {
              address,
              type,
              market: trade.title,
              amount: Math.round(amount * 100) / 100,
              timestamp: new Date(trade.timestamp * 1000).toISOString(),
            } as Activity;
          });

          allActivities.push(...activities);
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
