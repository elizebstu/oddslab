import axios from 'axios';
import { CacheMap } from './cache';
import { POLYMARKET_DATA_API, CACHE_TTL } from './constants';
import { getProfileDisplayName } from './profileCache';
import type { Position, PositionHolder, PolymarketPosition } from './types';

// Cache for aggregated positions
const positionsCache = new CacheMap<Position[]>(CACHE_TTL);

interface PositionData {
  market: string;
  outcome: string;
  totalValue: number;
  totalShares: number;
  avgPrice: number;
  currentPrice: number;
  cashPnl: number;
  percentPnl: number;
  holders: Map<string, { address: string; userName?: string; shares: number; value: number }>;
}

/**
 * Fetch positions for addresses
 * Returns aggregated positions by market with holder information
 * Uses shared profile cache (populated from activities) for user names
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
    const allPositions = new Map<string, PositionData>();

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
            // Get user name from shared profile cache (populated from activities)
            const userName = getProfileDisplayName(address);

            if (allPositions.has(marketKey)) {
              const existing = allPositions.get(marketKey)!;
              existing.totalValue += currentValue;
              existing.totalShares += position.size;
              existing.cashPnl += position.cashPnl;
              // Use weighted average for price and PNL
              existing.avgPrice = (existing.avgPrice * (existing.totalShares - position.size) + position.avgPrice * position.size) / existing.totalShares;
              existing.currentPrice = position.curPrice;
              existing.percentPnl = (existing.cashPnl / (existing.avgPrice * existing.totalShares)) * 100;

              // Add holder info
              existing.holders.set(address.toLowerCase(), {
                address,
                userName,
                shares: position.size,
                value: currentValue,
              });
            } else {
              const holders = new Map<string, { address: string; userName?: string; shares: number; value: number }>();
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
                avgPrice: position.avgPrice,
                currentPrice: position.curPrice,
                cashPnl: position.cashPnl,
                percentPnl: position.percentPnl,
                holders,
              });
            }
          }
        }
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(`Error fetching positions for address ${address}:`, message);
      }
    }

    // Convert to final format with holders array
    const positionsArray: Position[] = Array.from(allPositions.values())
      .map((pos) => ({
        market: pos.market,
        outcome: pos.outcome,
        totalValue: pos.totalValue,
        totalShares: pos.totalShares,
        avgPrice: pos.avgPrice,
        currentPrice: pos.currentPrice,
        cashPnl: pos.cashPnl,
        percentPnl: pos.percentPnl,
        holders: Array.from(pos.holders.values()) as PositionHolder[],
      }))
      .sort((a, b) => b.totalValue - a.totalValue);

    positionsCache.set(cacheKey, positionsArray);
    return positionsArray;
  } catch (error) {
    console.error('Error fetching Polymarket positions:', error);
    return [];
  }
};
