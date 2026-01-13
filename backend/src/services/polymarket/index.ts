// Re-export all services for backward compatibility
export { resolveUsernameToAddress, fetchPolymarketProfile, fetchProfilesSequentially } from './profileService';
export { checkIfBot } from './botDetectionService';
export { fetchPolymarketPositions } from './positionService';
export { fetchPolymarketActivities } from './activityService';
export {
  updateProfileFromActivity,
  getProfileDisplayName,
  setProfile,
  fetchProfileFromActivity,
  fetchProfilesFromActivities
} from './profileCache';

// Re-export types
export type { Activity, Position, PositionHolder } from './types';
