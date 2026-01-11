import axios from 'axios';

export interface Activity {
  address: string;
  type: 'buy' | 'sell' | 'redeem';
  market: string;
  amount: number;
  timestamp: string;
  userName?: string;
}

export interface Position {
  market: string;
  outcome: string;
  totalValue: number;
  totalShares: number;
  avgPrice: number;
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

interface PolymarketPosition {
  conditionId: string;
  outcomePrice: number;
  tokens: string;
  outcome: string;
  side: 'BUY' | 'SELL';
  market: {
    question: string;
    description: string;
    slug: string;
  };
}

const activityCache = new Map<string, { data: Activity[]; timestamp: number }>();
const profileCache = new Map<string, { data: { name?: string; username?: string } | null; timestamp: number }>();
const usernameCache = new Map<string, { data: string | null; timestamp: number }>();
const botCheckCache = new Map<string, { data: { isBot: boolean; tradeCount: number } | null; timestamp: number }>();
const positionsCache = new Map<string, { data: Position[]; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds
const BOT_CHECK_CACHE_TTL = 300000; // 5 minutes for bot check
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

interface SearchResult {
  id: string;
  type: string;
  profile?: PolymarketProfile;
}

/**
 * Resolve a Polymarket username to their wallet address
 * Returns the address if found, null otherwise
 */
export const resolveUsernameToAddress = async (
  username: string
): Promise<string | null> => {
  const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();
  const cached = usernameCache.get(cleanUsername);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const response = await axios.get<SearchResult[]>(`${POLYMARKET_GAMMA_API}/search`, {
      params: {
        query: cleanUsername,
        type: 'profile',
        limit: 5,
      },
      timeout: 10000,
    });

    const exactMatch = response.data.find((result) => {
      const displayUsername = result.profile?.displayUsernamePublic;
      const pseudonym = result.profile?.pseudonym;
      return (
        displayUsername?.toLowerCase() === cleanUsername ||
        pseudonym?.toLowerCase() === cleanUsername ||
        result.id.toLowerCase() === cleanUsername
      );
    });

    if (exactMatch && exactMatch.id.startsWith('0x')) {
      usernameCache.set(cleanUsername, { data: exactMatch.id, timestamp: Date.now() });
      return exactMatch.id;
    }

    usernameCache.set(cleanUsername, { data: null, timestamp: Date.now() });
    return null;
  } catch (error: any) {
    console.error(`Error resolving username ${username}:`, error.message);
    usernameCache.set(cleanUsername, { data: null, timestamp: Date.now() });
    return null;
  }
};

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

/**
 * Check if an address is a bot (more than 300 trades in the last hour)
 * Returns { isBot: boolean, tradeCount: number }
 */
export const checkIfBot = async (
  address: string
): Promise<{ isBot: boolean; tradeCount: number } | null> => {
  const cached = botCheckCache.get(address);

  if (cached && Date.now() - cached.timestamp < BOT_CHECK_CACHE_TTL) {
    return cached.data;
  }

  try {
    const oneHourAgo = Math.floor((Date.now() - 60 * 60 * 1000) / 1000);

    // Fetch trades from the last hour to count them
    const response = await axios.get<PolymarketTrade[]>(`${POLYMARKET_DATA_API}/trades`, {
      params: {
        user: address.toLowerCase(),
        limit: 500,
      },
      timeout: 15000,
    });

    if (response.data && Array.isArray(response.data)) {
      const recentTrades = response.data.filter((trade) => trade.timestamp >= oneHourAgo);
      const tradeCount = recentTrades.length;
      const isBot = tradeCount > 300;

      const result = { isBot, tradeCount };
      botCheckCache.set(address, { data: result, timestamp: Date.now() });

      return result;
    }

    botCheckCache.set(address, { data: null, timestamp: Date.now() });
    return null;
  } catch (error: any) {
    console.error(`Error checking bot status for address ${address}:`, error.message);
    botCheckCache.set(address, { data: null, timestamp: Date.now() });
    return null;
  }
};

/**
 * Fetch positions for addresses
 * Returns aggregated positions by market
 */
export const fetchPolymarketPositions = async (
  addresses: string[]
): Promise<Position[]> => {
  const cacheKey = `positions_${addresses.sort().join(',')}`;
  const cached = positionsCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const allPositions = new Map<string, Position>();

    for (const address of addresses) {
      try {
        const response = await axios.get<PolymarketPosition[]>(`${POLYMARKET_DATA_API}/positions`, {
          params: {
            address: address.toLowerCase(),
            limit: 100,
          },
          timeout: 10000,
        });

        if (response.data && Array.isArray(response.data)) {
          for (const position of response.data) {
            const marketKey = `${position.conditionId}_${position.outcome}`;
            const currentValue = parseFloat(position.tokens) * position.outcomePrice;

            if (allPositions.has(marketKey)) {
              const existing = allPositions.get(marketKey)!;
              existing.totalValue += currentValue;
              existing.totalShares += parseFloat(position.tokens);
            } else {
              allPositions.set(marketKey, {
                market: position.market.question || position.market.description || position.market.slug,
                outcome: position.outcome,
                totalValue: currentValue,
                totalShares: parseFloat(position.tokens),
                avgPrice: position.outcomePrice,
              });
            }
          }
        }
      } catch (error: any) {
        console.error(`Error fetching positions for address ${address}:`, error.message);
      }
    }

    const positionsArray = Array.from(allPositions.values()).sort((a, b) => b.totalValue - a.totalValue);

    positionsCache.set(cacheKey, { data: positionsArray, timestamp: Date.now() });

    return positionsArray;
  } catch (error) {
    console.error('Error fetching Polymarket positions:', error);
    return [];
  }
};

/**
 * Fetch trading activities for addresses
 */
export const fetchPolymarketActivities = async (addresses: string[]): Promise<Activity[]> => {
  const cacheKey = addresses.sort().join(',');
  const cached = activityCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
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
        // Use 'user' parameter instead of 'address' for the trades endpoint
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
      } catch (error: any) {
        console.error(`Error fetching activities for address ${address}:`, error.message);

        if (error.response?.data) {
          console.error('API Response:', JSON.stringify(error.response.data));
        }
      }
    }

    const sortedActivities = allActivities.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Limit to 100 most recent activities
    const limitedActivities = sortedActivities.slice(0, 100);

    activityCache.set(cacheKey, { data: limitedActivities, timestamp: Date.now() });

    return limitedActivities;
  } catch (error) {
    console.error('Error fetching Polymarket activities:', error);
    return [];
  }
};
