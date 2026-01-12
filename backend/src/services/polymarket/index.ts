// Re-export all services for backward compatibility
export { resolveUsernameToAddress, fetchPolymarketProfile } from './profileService';
export { checkIfBot } from './botDetectionService';
export { fetchPolymarketPositions } from './positionService';
export { fetchPolymarketActivities } from './activityService';

// Re-export types
export type { Activity, Position, PositionHolder } from './types';
