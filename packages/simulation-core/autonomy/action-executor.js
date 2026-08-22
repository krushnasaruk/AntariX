/**
 * AUTONOMY ACTION EXECUTOR
 * Translates validated action decisions into explicit calls on simulation objects.
 */

import { ActionType } from './autonomy-types.js';

export class AutonomyActionExecutor {
  /**
   * Executes a validated decision on simulation context.
   * @param {Object} decision Validated decision object
   * @param {Object} context { missionManager, rover, environment, dtnChannel }
   * @returns {Object} Execution result { success, result, action, events }
   */
  execute(decision, context = {}) {
    if (!decision || !decision.action) {
      throw new TypeError('Invalid decision provided for execution.');
    }

    const { missionManager, rover, environment, dtnChannel } = context;
    const action = decision.action;
    const payload = decision.payload || {};

    let success = true;
    let result = {};

    switch (action) {
      case ActionType.START_TASK:
        if (missionManager && payload.taskId) {
          result = missionManager.startTask(payload.taskId);
        }
        break;

      case ActionType.CONTINUE_TASK:
        if (missionManager && missionManager.getCurrentTask()) {
          result = { task: missionManager.getCurrentTask(), status: 'CONTINUED' };
        }
        break;

      case ActionType.MOVE_ROVER:
        if (rover && environment) {
          result = rover.moveRover(payload, environment);
          success = result.success !== false;
        }
        break;

      case ActionType.SCAN_TERRAIN:
        if (environment && rover) {
          result = {
            terrain: environment.getTerrainAt(rover.position.x, rover.position.y),
            nearbyObstacles: environment.getNearbyObstacles(rover.position, 50),
            nearbyHazards: environment.getNearbyHazards(rover.position, 50)
          };
        }
        break;

      case ActionType.DETECT_SAMPLE:
        if (rover && environment) {
          result = rover.detectSample(environment);
        }
        break;

      case ActionType.COLLECT_SAMPLE:
        if (rover && environment) {
          result = rover.collectSample(environment);
          success = result.success !== false;
          if (success && missionManager) {
            missionManager.completeTask('TASK-4', { sampleCollected: true });
          }
        }
        break;

      case ActionType.VERIFY_SAMPLE:
        if (rover && environment) {
          result = rover.verifySample(environment);
          success = result.success !== false;
          if (success && missionManager) {
            missionManager.completeTask('TASK-5', { sampleVerified: true });
          }
        }
        break;

      case ActionType.RETURN_TO_BASE:
        if (rover && environment) {
          result = rover.moveRover({ targetPosition: environment.base.position }, environment);
          success = result.success !== false;
        }
        break;

      case ActionType.WAIT:
        if (rover) {
          rover.stopRover();
          result = { state: 'WAITING' };
        }
        break;

      case ActionType.PAUSE_MISSION:
        if (missionManager) {
          missionManager.pauseMission();
          result = { missionStatus: 'PAUSED' };
        }
        break;

      case ActionType.ABORT_MISSION:
        if (missionManager) {
          missionManager.abortMission(payload.reason || 'Aborted by Autonomy Engine');
          result = { missionStatus: 'ABORTED' };
        }
        break;

      case ActionType.SEND_STATUS_REPORT:
        if (dtnChannel) {
          result = dtnChannel.sendPacket({
            source: 'MARS',
            destination: 'EARTH',
            type: 'TELEMETRY',
            payload: { statusReport: 'MISSION_PROGRESS', progressPct: missionManager ? missionManager.getMissionProgress() : 100 }
          });
        }
        break;

      case ActionType.REQUEST_EARTH_GUIDANCE:
        if (dtnChannel) {
          result = dtnChannel.sendPacket({
            source: 'MARS',
            destination: 'EARTH',
            type: 'ALERT',
            priority: 4, // CRITICAL
            requiresAcknowledgement: true,
            payload: { alert: 'EARTH_GUIDANCE_REQUIRED', reason: decision.reason }
          });
        }
        break;

      default:
        throw new Error(`Unknown action type: "${action}".`);
    }

    return {
      success,
      action,
      result,
      timestamp: Date.now()
    };
  }
}
