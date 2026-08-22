/**
 * @typedef {Object} RoverSubsystemStatus
 * @property {'NOMINAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE'} battery
 * @property {'NOMINAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE'} thermal
 * @property {'NOMINAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE'} navigation
 * @property {'NOMINAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE'} communications
 * @property {'NOMINAL' | 'WARNING' | 'CRITICAL' | 'OFFLINE'} sciencePayload
 */

export const SubsystemState = {
  NOMINAL: 'NOMINAL',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  OFFLINE: 'OFFLINE'
};
