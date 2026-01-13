import type { Address } from './roomService';
import type { Activity, Position } from './polymarketDirect';

interface RoomCache {
  addresses: Address[];
  activities: Activity[];
  positions: Position[];
  lastUpdated: number;
}

const CACHE_KEY_PREFIX = 'room_cache_';
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes cache TTL

/**
 * Get cached data for a room
 */
export const getRoomCache = (roomId: string): RoomCache | null => {
  try {
    const key = CACHE_KEY_PREFIX + roomId;
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const data: RoomCache = JSON.parse(cached);

    // Check if cache is still valid (within TTL)
    if (Date.now() - data.lastUpdated > CACHE_TTL) {
      // Cache expired, but still return it for immediate display
      // The caller will refresh in background
      return data;
    }

    return data;
  } catch (error) {
    console.error('Error reading room cache:', error);
    return null;
  }
};

/**
 * Save room data to cache
 */
export const setRoomCache = (
  roomId: string,
  addresses: Address[],
  activities: Activity[],
  positions: Position[]
): void => {
  try {
    const key = CACHE_KEY_PREFIX + roomId;
    const data: RoomCache = {
      addresses,
      activities,
      positions,
      lastUpdated: Date.now(),
    };
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving room cache:', error);
  }
};

/**
 * Update only addresses in cache
 */
export const updateAddressCache = (roomId: string, addresses: Address[]): void => {
  const cached = getRoomCache(roomId);
  if (cached) {
    setRoomCache(roomId, addresses, cached.activities, cached.positions);
  } else {
    setRoomCache(roomId, addresses, [], []);
  }
};

/**
 * Update only activities in cache
 */
export const updateActivitiesCache = (roomId: string, activities: Activity[]): void => {
  const cached = getRoomCache(roomId);
  if (cached) {
    setRoomCache(roomId, cached.addresses, activities, cached.positions);
  } else {
    setRoomCache(roomId, [], activities, []);
  }
};

/**
 * Update only positions in cache
 */
export const updatePositionsCache = (roomId: string, positions: Position[]): void => {
  const cached = getRoomCache(roomId);
  if (cached) {
    setRoomCache(roomId, cached.addresses, cached.activities, positions);
  } else {
    setRoomCache(roomId, [], [], positions);
  }
};

/**
 * Clear cache for a specific room
 */
export const clearRoomCache = (roomId: string): void => {
  try {
    const key = CACHE_KEY_PREFIX + roomId;
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Error clearing room cache:', error);
  }
};

/**
 * Clear all room caches
 */
export const clearAllRoomCaches = (): void => {
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch (error) {
    console.error('Error clearing all room caches:', error);
  }
};

/**
 * Check if cache is stale (older than TTL)
 */
export const isCacheStale = (roomId: string): boolean => {
  const cached = getRoomCache(roomId);
  if (!cached) return true;
  return Date.now() - cached.lastUpdated > CACHE_TTL;
};
