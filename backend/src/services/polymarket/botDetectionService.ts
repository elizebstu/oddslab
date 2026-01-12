import axios from 'axios';
import { CacheMap } from './cache';
import { POLYMARKET_DATA_API, BOT_CHECK_CACHE_TTL } from './constants';
import type { PolymarketTrade } from './types';

// Cache with longer TTL for bot checks
const botCheckCache = new CacheMap<{ isBot: boolean; tradeCount: number } | null>(BOT_CHECK_CACHE_TTL);

/**
 * Check if an address is a bot (more than 300 trades in the last hour)
 * Returns { isBot: boolean, tradeCount: number }
 */
export const checkIfBot = async (
  address: string
): Promise<{ isBot: boolean; tradeCount: number } | null> => {
  const cached = botCheckCache.get(address);
  if (cached !== null) {
    return cached;
  }

  try {
    const oneHourAgo = Math.floor((Date.now() - 60 * 60 * 1000) / 1000);

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
      botCheckCache.set(address, result);
      return result;
    }

    botCheckCache.set(address, null);
    return null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error checking bot status for address ${address}:`, message);
    botCheckCache.set(address, null);
    return null;
  }
};
