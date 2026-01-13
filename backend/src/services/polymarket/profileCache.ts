import axios from 'axios';
import { CacheMap } from './cache';
import { CACHE_TTL, POLYMARKET_DATA_API } from './constants';

// Shared profile cache populated from activity responses
// This avoids needing to call the Gamma API separately for profiles
const profileCache = new CacheMap<string>(CACHE_TTL * 10); // 10x longer TTL for profiles

// Rate limiting
const API_DELAY = 500; // 500ms between requests
let lastApiCall = 0;

const waitForRateLimit = async (): Promise<void> => {
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCall;
  if (timeSinceLastCall < API_DELAY) {
    await new Promise(resolve => setTimeout(resolve, API_DELAY - timeSinceLastCall));
  }
  lastApiCall = Date.now();
};

/**
 * Retry with exponential backoff
 */
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> => {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await waitForRateLimit();
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      // Don't retry on ECONNRESET - it's a network-level block
      if (lastError.message.includes('ECONNRESET')) {
        throw lastError;
      }
      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
};

/**
 * Update profile cache from activity data
 * Called when we receive activity data that includes name/pseudonym
 */
export const updateProfileFromActivity = (address: string, displayName: string): void => {
  if (displayName) {
    profileCache.set(address.toLowerCase(), displayName);
  }
};

/**
 * Get display name from cache
 * Returns undefined if not found
 */
export const getProfileDisplayName = (address: string): string | undefined => {
  const cached = profileCache.get(address.toLowerCase());
  return cached === null ? undefined : cached;
};

/**
 * Get all cached profiles as a Map
 */
export const getCachedProfiles = (): Map<string, string> => {
  const result = new Map<string, string>();
  // Note: CacheMap doesn't expose iteration, so we can't do this directly
  // The caller should track addresses they need and query individually
  return result;
};

/**
 * Set profile directly (for use when adding addresses via username)
 */
export const setProfile = (address: string, displayName: string): void => {
  profileCache.set(address.toLowerCase(), displayName);
};

interface ActivityResponse {
  name?: string;
  pseudonym?: string;
  proxyWallet: string;
}

/**
 * Fetch profile info for an address by getting a single activity
 * This uses the Data API which includes name/pseudonym in the response
 */
export const fetchProfileFromActivity = async (address: string): Promise<string | undefined> => {
  // Check cache first
  const cached = getProfileDisplayName(address);
  if (cached) {
    return cached;
  }

  try {
    const response = await axios.get<ActivityResponse[]>(`${POLYMARKET_DATA_API}/activity`, {
      params: {
        user: address.toLowerCase(),
        limit: 1,
      },
      timeout: 10000,
    });

    if (response.data && response.data.length > 0) {
      const activity = response.data[0];
      const displayName = activity.name || activity.pseudonym;
      if (displayName) {
        profileCache.set(address.toLowerCase(), displayName);
        return displayName;
      }
    }
    return undefined;
  } catch (error) {
    console.error(`Error fetching profile for ${address}:`, error instanceof Error ? error.message : 'Unknown error');
    return undefined;
  }
};

/**
 * Fetch profiles for multiple addresses
 * Uses the Data API activity endpoint to get profile info
 */
export const fetchProfilesFromActivities = async (
  addresses: string[]
): Promise<Map<string, { name?: string; username?: string } | null>> => {
  const results = new Map<string, { name?: string; username?: string } | null>();

  for (const address of addresses) {
    const displayName = await fetchProfileFromActivity(address);
    if (displayName) {
      results.set(address.toLowerCase(), { name: displayName });
    } else {
      results.set(address.toLowerCase(), null);
    }
  }

  return results;
};
