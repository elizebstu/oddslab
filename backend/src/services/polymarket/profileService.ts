import axios from 'axios';
import { CacheMap } from './cache';
import { POLYMARKET_GAMMA_API, CACHE_TTL } from './constants';
import type { PolymarketProfile, SearchResult } from './types';

// Caches
const profileCache = new CacheMap<{ name?: string; username?: string } | null>(CACHE_TTL);
const usernameCache = new CacheMap<string | null>(CACHE_TTL);

// Rate limiting: delay between API calls (ms)
const API_DELAY = 200;
let lastApiCall = 0;

/**
 * Wait to respect rate limiting
 */
const waitForRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  if (timeSinceLastCall < API_DELAY) {
    await new Promise(resolve => setTimeout(resolve, API_DELAY - timeSinceLastCall));
  }
  lastApiCall = Date.now();
};

/**
 * Retry a function with exponential backoff
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 500
): Promise<T> => {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await waitForRateLimit();
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

/**
 * Resolve a Polymarket username to their wallet address
 * Returns the address if found, null otherwise
 */
export const resolveUsernameToAddress = async (
  username: string
): Promise<string | null> => {
  const cleanUsername = username.replace(/^@/, '').trim().toLowerCase();

  const cached = usernameCache.get(cleanUsername);
  if (cached !== null) {
    return cached;
  }

  try {
    const response = await retryWithBackoff(() =>
      axios.get<SearchResult[]>(`${POLYMARKET_GAMMA_API}/search`, {
        params: {
          query: cleanUsername,
          type: 'profile',
          limit: 5,
        },
        timeout: 15000,
      })
    );

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
      usernameCache.set(cleanUsername, exactMatch.id);
      return exactMatch.id;
    }

    usernameCache.set(cleanUsername, null);
    return null;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error resolving username ${username}:`, message);
    usernameCache.set(cleanUsername, null);
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
  if (cached !== null) {
    return cached;
  }

  try {
    const response = await retryWithBackoff(() =>
      axios.get<PolymarketProfile>(`${POLYMARKET_GAMMA_API}/public-profile`, {
        params: {
          address: address.toLowerCase(),
        },
        timeout: 15000,
      })
    );

    const profile = response.data;
    const result = {
      name: profile.name,
      username: profile.displayUsernamePublic || profile.pseudonym,
    };

    profileCache.set(address, result);
    return result;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error fetching profile for address ${address}:`, message);
    profileCache.set(address, null);
    return null;
  }
};

/**
 * Fetch profiles for multiple addresses sequentially to avoid rate limiting
 */
export const fetchProfilesSequentially = async (
  addresses: string[]
): Promise<Map<string, { name?: string; username?: string } | null>> => {
  const results = new Map<string, { name?: string; username?: string } | null>();

  for (const address of addresses) {
    const profile = await fetchPolymarketProfile(address);
    results.set(address.toLowerCase(), profile);
  }

  return results;
};
