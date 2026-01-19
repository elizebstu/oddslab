import { useState, useEffect, useCallback, useRef } from 'react';
import type { Activity } from '../services/roomService';
import { groupActivities as groupActivitiesUtil, validateActivities, sortActivitiesByDate } from '../utils/activityTransformers';
import { activityService } from '../services/activityService';

export interface UseActivitiesOptions {
  /** Auto-refresh interval in milliseconds (0 to disable) */
  refreshInterval?: number;
  /** Whether to automatically fetch on mount */
  enabled?: boolean;
  /** Group activities by date */
  groupByDate?: boolean;
}

export interface UseActivitiesResult {
  activities: Activity[];
  groupedActivities: ReturnType<typeof groupActivitiesUtil>;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  lastFetchTime: Date | null;
}

/**
 * Custom hook for fetching and managing activity data.
 * Handles loading states, error handling, auto-refresh, and data transformation.
 */
export function useActivities(
  roomId: string,
  options: UseActivitiesOptions = {}
): UseActivitiesResult {
  const {
    refreshInterval = 30000, // 30 seconds default
    enabled = true,
    groupByDate = true,
  } = options;

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<Date | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const mountedRef = useRef(true);

  const fetchData = useCallback(async (isRefresh = false) => {
    if (!roomId || !enabled) return;

    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);

      const data = await activityService.getActivities(roomId);
      const validated = validateActivities(data);
      const sorted = sortActivitiesByDate(validated);

      if (mountedRef.current) {
        setActivities(sorted);
        setLastFetchTime(new Date());
      }
    } catch (err) {
      if (mountedRef.current) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to fetch activities';
        setError(errorMessage);
        console.error('Error fetching activities:', err);
      }
    } finally {
      if (mountedRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [roomId, enabled]);

  const refresh = useCallback(() => fetchData(true), [fetchData]);

  // Set up auto-refresh
  useEffect(() => {
    if (refreshInterval > 0 && enabled && roomId) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, refreshInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refreshInterval, enabled, roomId, fetchData]);

  // Initial fetch
  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []); // Only run on mount

  const groupedActivities = groupByDate ? groupActivitiesUtil(activities) : [];

  return {
    activities,
    groupedActivities,
    isLoading,
    isRefreshing,
    error,
    refresh,
    lastFetchTime,
  };
}
