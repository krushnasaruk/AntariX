/**
 * @typedef {Object} MissionState
 * @property {string} missionId
 * @property {string} name
 * @property {'PLANNING' | 'IN_PROGRESS' | 'PAUSED' | 'SAFE_MODE' | 'COMPLETED' | 'ABORTED'} status
 * @property {number} currentSol
 * @property {number} currentWaypointIndex
 * @property {Array<{x: number, y: number, altitude: number, label: string}>} waypoints
 * @property {string} activeObjective
 */

export const MissionStatus = {
  PLANNING: 'PLANNING',
  IN_PROGRESS: 'IN_PROGRESS',
  PAUSED: 'PAUSED',
  SAFE_MODE: 'SAFE_MODE',
  COMPLETED: 'COMPLETED',
  ABORTED: 'ABORTED'
};
