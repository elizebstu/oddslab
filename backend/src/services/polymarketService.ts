// Re-export all Polymarket services for backward compatibility
// This file maintains the existing API while the implementation has been
// split into focused modules in the polymarket/ directory

export {
  resolveUsernameToAddress,
  fetchPolymarketProfile,
  fetchProfilesSequentially,
  checkIfBot,
  fetchPolymarketPositions,
  fetchPolymarketActivities,
  fetchProfilesFromActivities,
  setProfile,
} from './polymarket';

export type { Activity, Position } from './polymarket';
