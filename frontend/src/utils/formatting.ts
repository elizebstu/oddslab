import type { Activity } from '../services/roomService';

/**
 * Truncate an Ethereum address for display
 * @example formatAddress('0x1234567890abcdef...') -> '0x1234...cdef'
 */
export const formatAddress = (address: string): string => {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Get display name for an activity - username if available, otherwise truncated address
 */
export const formatDisplayName = (activity: Activity): string => {
  if (activity.userName) {
    return activity.userName;
  }
  return formatAddress(activity.address);
};

/**
 * Format a timestamp as a relative time string
 * @example formatTimestamp('2024-01-01T00:00:00Z') -> '2d ago'
 */
export const formatTimestamp = (timestamp: string, t?: any): string => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (t) {
    if (diffMins < 1) return t('common.time.now');
    if (diffMins < 60) return t('common.time.m_ago', { count: diffMins });
    if (diffHours < 24) return t('common.time.h_ago', { count: diffHours });
    if (diffDays < 7) return t('common.time.d_ago', { count: diffDays });
  } else {
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
  }
  return date.toLocaleDateString();
};

/**
 * Get rank badge styling for position rankings
 */
export interface RankBadge {
  emoji: string;
  bg: string;
  border: string;
}

export const getRankBadge = (index: number): RankBadge | null => {
  if (index === 0) return { emoji: '🥇', bg: 'bg-yellow-50', border: 'border-yellow-200' };
  if (index === 1) return { emoji: '🥈', bg: 'bg-gray-50', border: 'border-gray-200' };
  if (index === 2) return { emoji: '🥉', bg: 'bg-orange-50', border: 'border-orange-200' };
  return null;
};

/**
 * Get rank badge styling for inline display (alternative colors for different UI)
 */
export const getRankBadgeClasses = (index: number): string => {
  if (index === 0) return 'bg-yellow-100 text-yellow-700';
  if (index === 1) return 'bg-gray-200 text-gray-700';
  if (index === 2) return 'bg-orange-100 text-orange-700';
  return 'bg-gray-100 text-gray-600';
};
