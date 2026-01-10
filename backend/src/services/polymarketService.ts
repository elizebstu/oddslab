interface Activity {
  address: string;
  type: 'buy' | 'sell' | 'redeem';
  market: string;
  amount: number;
  timestamp: string;
}

const activityCache = new Map<string, { data: Activity[]; timestamp: number }>();
const CACHE_TTL = 60000; // 60 seconds

export const fetchPolymarketActivities = async (addresses: string[]): Promise<Activity[]> => {
  const cacheKey = addresses.sort().join(',');
  const cached = activityCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  try {
    const allActivities: Activity[] = [];

    for (const address of addresses) {
      // TODO: Replace with actual Polymarket API call
      // For now, using mock data
      const mockActivities = generateMockActivities(address);
      allActivities.push(...mockActivities);
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

function generateMockActivities(address: string): Activity[] {
  const types: Array<'buy' | 'sell' | 'redeem'> = ['buy', 'sell', 'redeem'];
  const markets = [
    'Will Trump win 2024?',
    'Bitcoin above $100k by EOY?',
    'AI regulation passed in 2024?',
  ];

  return Array.from({ length: 5 }, (_, i) => ({
    address,
    type: types[Math.floor(Math.random() * types.length)],
    market: markets[Math.floor(Math.random() * markets.length)],
    amount: Math.floor(Math.random() * 10000) + 100,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  }));
}
