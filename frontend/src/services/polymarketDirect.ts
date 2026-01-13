import axios from 'axios';

const POLYMARKET_DATA_API = 'https://data-api.polymarket.com';

export interface PolymarketActivity {
  name?: string;
  pseudonym?: string;
  proxyWallet: string;
  timestamp: number;
  type: string;
  side?: string;
  title: string;
  outcome: string;
  usdcSize: number;
  icon?: string;
  transactionHash: string;
}

export interface PolymarketPosition {
  conditionId: string;
  outcome: string;
  title: string;
  size: number;
  currentValue: number;
  avgPrice: number;
  curPrice: number;
  cashPnl: number;
  percentPnl: number;
}

export interface Activity {
  address: string;
  type: 'buy' | 'sell' | 'redeem' | 'split' | 'merge' | 'reward' | 'conversion' | 'maker_rebate';
  market: string;
  amount: number;
  timestamp: string;
  userName?: string;
  outcome?: string;
  icon?: string;
  transactionHash?: string;
}

export interface PositionHolder {
  address: string;
  userName?: string;
  shares: number;
  value: number;
}

export interface Position {
  market: string;
  outcome: string;
  totalValue: number;
  totalShares: number;
  holders: PositionHolder[];
  conditionId?: string;
}

// Cache for profile names learned from activities
const profileNameCache = new Map<string, string>();

/**
 * Fetch activities directly from Polymarket Data API (browser-side)
 */
export const fetchActivitiesFromPolymarket = async (addresses: string[]): Promise<Activity[]> => {
  const allActivities: Activity[] = [];
  const oneDayAgo = Math.floor((Date.now() - 24 * 60 * 60 * 1000) / 1000);

  for (const address of addresses) {
    try {
      const response = await axios.get<PolymarketActivity[]>(`${POLYMARKET_DATA_API}/activity`, {
        params: {
          user: address.toLowerCase(),
          limit: 500,
        },
        timeout: 15000,
      });

      if (response.data && Array.isArray(response.data)) {
        const activities = response.data.filter((a) => a.timestamp >= oneDayAgo);

        for (const activity of activities) {
          let type: Activity['type'];
          if (activity.type === 'TRADE' && activity.side) {
            type = activity.side === 'BUY' ? 'buy' : 'sell';
          } else if (activity.type === 'REDEEM') {
            type = 'redeem';
          } else {
            type = 'buy';
          }

          const displayName = activity.name || activity.pseudonym;
          if (displayName) {
            profileNameCache.set(address.toLowerCase(), displayName);
          }

          allActivities.push({
            address,
            type,
            market: activity.title,
            amount: Math.round(activity.usdcSize * 100) / 100,
            timestamp: new Date(activity.timestamp * 1000).toISOString(),
            userName: displayName,
            outcome: activity.outcome,
            icon: activity.icon,
            transactionHash: activity.transactionHash,
          });
        }
      }
    } catch (error) {
      console.error(`Error fetching activities for ${address}:`, error);
    }
  }

  return allActivities.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  ).slice(0, 100);
};

/**
 * Fetch positions directly from Polymarket Data API (browser-side)
 */
export const fetchPositionsFromPolymarket = async (addresses: string[]): Promise<Position[]> => {
  const allPositions = new Map<string, {
    market: string;
    outcome: string;
    totalValue: number;
    totalShares: number;
    holders: Map<string, PositionHolder>;
    conditionId: string;
  }>();

  for (const address of addresses) {
    try {
      const response = await axios.get<PolymarketPosition[]>(`${POLYMARKET_DATA_API}/positions`, {
        params: {
          user: address.toLowerCase(),
        },
        timeout: 10000,
      });

      if (response.data && Array.isArray(response.data)) {
        const userName = profileNameCache.get(address.toLowerCase());

        for (const position of response.data) {
          const marketKey = `${position.conditionId}_${position.outcome}`;
          const currentValue = position.currentValue || 0;

          if (allPositions.has(marketKey)) {
            const existing = allPositions.get(marketKey)!;
            existing.totalValue += currentValue;
            existing.totalShares += position.size;
            existing.holders.set(address.toLowerCase(), {
              address,
              userName,
              shares: position.size,
              value: currentValue,
            });
          } else {
            const holders = new Map<string, PositionHolder>();
            holders.set(address.toLowerCase(), {
              address,
              userName,
              shares: position.size,
              value: currentValue,
            });
            allPositions.set(marketKey, {
              market: position.title,
              outcome: position.outcome,
              totalValue: currentValue,
              totalShares: position.size,
              holders,
              conditionId: position.conditionId,
            });
          }
        }
      }
    } catch (error) {
      console.error(`Error fetching positions for ${address}:`, error);
    }
  }

  return Array.from(allPositions.values())
    .map((pos) => ({
      market: pos.market,
      outcome: pos.outcome,
      totalValue: pos.totalValue,
      totalShares: pos.totalShares,
      holders: Array.from(pos.holders.values()),
      conditionId: pos.conditionId,
    }))
    .sort((a, b) => b.totalValue - a.totalValue);
};

/**
 * Get cached profile name for an address
 */
export const getProfileName = (address: string): string | undefined => {
  return profileNameCache.get(address.toLowerCase());
};

/**
 * Fetch a single activity to get profile name
 */
export const fetchProfileName = async (address: string): Promise<string | undefined> => {
  const cached = profileNameCache.get(address.toLowerCase());
  if (cached) return cached;

  try {
    const response = await axios.get<PolymarketActivity[]>(`${POLYMARKET_DATA_API}/activity`, {
      params: {
        user: address.toLowerCase(),
        limit: 1,
      },
      timeout: 10000,
    });

    if (response.data && response.data.length > 0) {
      const displayName = response.data[0].name || response.data[0].pseudonym;
      if (displayName) {
        profileNameCache.set(address.toLowerCase(), displayName);
        return displayName;
      }
    }
  } catch (error) {
    console.error(`Error fetching profile for ${address}:`, error);
  }
  return undefined;
};

/**
 * Fetch profile names for multiple addresses
 */
export const fetchProfileNames = async (addresses: string[]): Promise<Map<string, string>> => {
  const results = new Map<string, string>();

  for (const address of addresses) {
    const name = await fetchProfileName(address);
    if (name) {
      results.set(address.toLowerCase(), name);
    }
  }

  return results;
};
