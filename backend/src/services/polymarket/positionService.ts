import axios from 'axios';
import { CacheMap } from './cache';
import { POLYMARKET_DATA_API, CACHE_TTL } from './constants';
import type { Position, PolymarketPosition } from './types';

// Cache for aggregated positions
const positionsCache = new CacheMap<Position[]>(CACHE_TTL);

/**
 * Fetch positions for addresses
 * Returns aggregated positions by market
 */
export const fetchPolymarketPositions = async (
  addresses: string[]
): Promise<Position[]> => {
  const cacheKey = `positions_${addresses.sort().join(',')}`;

  const cached = positionsCache.get(cacheKey);
  if (cached !== null) {
    return cached;
  }

  try {
    const allPositions = new Map<string, Position>();

    for (const address of addresses) {
      try {
        const response = await axios.get<PolymarketPosition[]>(`${POLYMARKET_DATA_API}/positions`, {
          params: {
            user: address.toLowerCase(),
          },
          timeout: 10000,
        });

        if (response.data && Array.isArray(response.data)) {
          for (const position of response.data) {
            const marketKey = `${position.conditionId}_${position.outcome}`;
            const currentValue = position.currentValue || 0;

            if (allPositions.has(marketKey)) {
              const existing = allPositions.get(marketKey)!;
              existing.totalValue += currentValue;
              existing.totalShares += position.size;
              existing.cashPnl += position.cashPnl;
              // Use weighted average for price and PNL
              existing.avgPrice = (existing.avgPrice * (existing.totalShares - position.size) + position.avgPrice * position.size) / existing.totalShares;
              existing.currentPrice = position.curPrice;
              existing.percentPnl = (existing.cashPnl / (existing.avgPrice * existing.totalShares)) * 100;
            } else {
              allPositions.set(marketKey, {
                market: position.title,
                outcome: position.outcome,
                totalValue: currentValue,
                totalShares: position.size,
                avgPrice: position.avgPrice,
                currentPrice: position.curPrice,
                cashPnl: position.cashPnl,
                percentPnl: position.percentPnl,
              });
            }
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching positions for address ${address}:`, message);
      }
    }

    const positionsArray = Array.from(allPositions.values()).sort((a, b) => b.totalValue - a.totalValue);
    positionsCache.set(cacheKey, positionsArray);
    return positionsArray;
  } catch (error) {
    console.error('Error fetching Polymarket positions:', error);
    return [];
  }
};
