import axios from 'axios';

export interface Activity {
  address: string;
  type: 'buy' | 'sell' | 'redeem';
  market: string;
  amount: number;
  timestamp: string;
  userName?: string;
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
const profileCache = new Map<string, { data: { name?: string; username?: string } | null; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds
const POLYMARKET_DATA_API = 'https://data-api.polymarket.com';
const POLYMARKET_GAMMA_API = 'https://gamma-api.polymarket.com';

interface PolymarketProfile {
  displayUsernamePublic?: string;
  pseudonym?: string;
  name?: string;
  profileImage?: string;
  createdAt?: string;
  proxyWallet?: string;
}

/**
 * Fetch user profile by wallet address from Polymarket Gamma API
 */
export const fetchPolymarketProfile = async (
  address: string
): Promise<{ name?: string; username?: string } | null> => {
  const cached = profileCache.get(address);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await axios.get<PolymarketProfile>(`${POLYMARKET_GAMMA_API}/public-profile`, {
      params: {
        address: address.toLowerCase(),
      },
      timeout: 10000,
    });

    const profile = response.data;
    const result = {
      name: profile.name,
      username: profile.displayUsernamePublic || profile.pseudonym,
    };

    profileCache.set(address, { data: result, timestamp: Date.now() });

    return result;
  } catch (error: any) {
    console.error(`Error fetching profile for address ${address}:`, error.message);
    profileCache.set(address, { data: null, timestamp: Date.now() });
    return null;
  }
};

export const fetchPolymarketActivities = async (addresses: string[]): Promise<Activity[]> => {
  const cacheKey = addresses.sort().join(',');
  const cached = activityCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const allActivities: Activity[] = [];
    const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000); // 24 hours ago in seconds

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
              userName: profileMap.get(address.toLowerCase()),
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
