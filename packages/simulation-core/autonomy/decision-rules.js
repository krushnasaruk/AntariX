/**
 * TRANSPARENT RULE-BASED REASONING ENGINE RULES
 */

import { ActionType, RulePriority } from './autonomy-types.js';

export class SafetyBatteryRule {
  evaluate(obs) {
    const battery = obs.rover.batteryLevel;
    const reserve = obs.constraints.minimumBatteryReserve || 0.15;

    if (battery < reserve) {
      const isCriticallyLow = battery < 0.05;
      const action = isCriticallyLow ? ActionType.WAIT : ActionType.RETURN_TO_BASE;

      return {
        triggered: true,
        priority: RulePriority.SAFETY_EMERGENCY, // 100
        action,
        confidence: 0.95,
        reason: {
          primary: 'BATTERY_BELOW_RESERVE',
          description: `Rover battery level (${(battery * 100).toFixed(1)}%) is below minimum reserve (${(reserve * 100).toFixed(1)}%).`
        },
        evidence: {
          batteryLevel: battery,
          minimumReserve: reserve
        },
        requiresEarthApproval: false
      };
    }

    return { triggered: false };
  }
}

export class RoverHealthRule {
  evaluate(obs) {
    if (obs.rover.health !== 'NOMINAL') {
      return {
        triggered: true,
        priority: RulePriority.SAFETY_EMERGENCY, // 100
        action: ActionType.PAUSE_MISSION,
        confidence: 0.95,
        reason: {
          primary: 'ROVER_HEALTH_DEGRADED',
          description: `Rover health is degraded (${obs.rover.health}).`
        },
        evidence: {
          health: obs.rover.health
        },
        requiresEarthApproval: true
      };
    }

    return { triggered: false };
  }
}

export class ObstacleSafetyRule {
  evaluate(obs) {
    const nearbyObstacles = obs.environment.nearbyObstacles || [];
    const directObstacle = nearbyObstacles.find(o => {
      const dx = o.position.x - obs.rover.position.x;
      const dy = o.position.y - obs.rover.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist <= (o.radius + 5);
    });

    if (directObstacle) {
      return {
        triggered: true,
        priority: RulePriority.HAZARD_SAFETY, // 80
        action: ActionType.WAIT,
        confidence: 0.90,
        reason: {
          primary: 'OBSTACLE_SAFETY_WARNING',
          description: `Known obstacle (${directObstacle.name}) detected directly ahead.`
        },
        evidence: {
          obstacle: directObstacle
        },
        requiresEarthApproval: false
      };
    }

    return { triggered: false };
  }
}

export class HazardSafetyRule {
  evaluate(obs) {
    const nearbyHazards = obs.environment.nearbyHazards || [];
    const criticalHazard = nearbyHazards.find(h => h.severity === 'CRITICAL' || h.severity === 'HIGH');

    if (criticalHazard) {
      return {
        triggered: true,
        priority: RulePriority.HAZARD_SAFETY, // 80
        action: ActionType.SCAN_TERRAIN,
        confidence: 0.85,
        reason: {
          primary: 'CRITICAL_HAZARD_NEARBY',
          description: `Active hazard (${criticalHazard.name}) in proximity.`
        },
        evidence: {
          hazard: criticalHazard
        },
        requiresEarthApproval: false
      };
    }

    return { triggered: false };
  }
}

export class SampleCollectionRule {
  evaluate(obs) {
    const task = obs.currentTask || (obs.readyTasks && obs.readyTasks[0]);
    if (!task) return { triggered: false };

    const sampleLoc = obs.environment.missionLocations ? obs.environment.missionLocations.sample : { x: 520, y: 530 };
    const dx = sampleLoc.x - obs.rover.position.x;
    const dy = sampleLoc.y - obs.rover.position.y;
    const distToSample = Math.sqrt(dx * dx + dy * dy);

    // TASK-4: Collect geological sample
    if (task.id === 'TASK-4' || task.name === 'Collect geological sample') {
      if (distToSample <= 5) {
        return {
          triggered: true,
          priority: RulePriority.MISSION_OBJECTIVE, // 50
          action: ActionType.COLLECT_SAMPLE,
          confidence: 0.95,
          reason: {
            primary: 'SAMPLE_COLLECTION_READY',
            description: `Rover is within collection distance (${distToSample.toFixed(2)}m <= 5m) of target sample.`
          },
          evidence: {
            distanceToSample: distToSample,
            sampleLocation: sampleLoc
          },
          requiresEarthApproval: false
        };
      } else {
        return {
          triggered: true,
          priority: RulePriority.MISSION_OBJECTIVE,
          action: ActionType.MOVE_ROVER,
          confidence: 0.90,
          payload: { targetPosition: sampleLoc },
          reason: {
            primary: 'NAVIGATE_TO_SAMPLE',
            description: `Navigating rover toward sample location (${distToSample.toFixed(2)}m away).`
          },
          evidence: {
            distanceToSample: distToSample,
            targetPosition: sampleLoc
          },
          requiresEarthApproval: false
        };
      }
    }

    // TASK-5: Verify sample
    if (task.id === 'TASK-5' || task.name === 'Verify sample') {
      return {
        triggered: true,
        priority: RulePriority.MISSION_OBJECTIVE,
        action: ActionType.VERIFY_SAMPLE,
        confidence: 0.95,
        reason: {
          primary: 'SAMPLE_VERIFICATION_READY',
          description: 'Verifying core sample with on-board spectrometer.'
        },
        evidence: {
          samplesCollectedCount: obs.rover.samplesCollected ? obs.rover.samplesCollected.length : 1
        },
        requiresEarthApproval: false
      };
    }

    return { triggered: false };
  }
}

export class MissionProgressRule {
  evaluate(obs) {
    if (obs.mission && obs.mission.status === 'COMPLETED') {
      return {
        triggered: true,
        priority: RulePriority.MISSION_OBJECTIVE,
        action: ActionType.SEND_STATUS_REPORT,
        confidence: 0.95,
        reason: {
          primary: 'MISSION_COMPLETED',
          description: 'All mission objectives and tasks have been successfully completed.'
        },
        evidence: {
          progressPct: obs.missionProgress
        },
        requiresEarthApproval: false
      };
    }

    if (obs.currentTask && obs.currentTask.status === 'IN_PROGRESS') {
      return {
        triggered: true,
        priority: RulePriority.AUTONOMY_PROGRESS, // 30
        action: ActionType.CONTINUE_TASK,
        confidence: 0.90,
        reason: {
          primary: 'CONTINUE_ACTIVE_TASK',
          description: `Continuing active task "${obs.currentTask.name}".`
        },
        evidence: {
          taskId: obs.currentTask.id,
          taskName: obs.currentTask.name
        },
        requiresEarthApproval: false
      };
    }

    if (obs.readyTasks && obs.readyTasks.length > 0) {
      const readyTask = obs.readyTasks[0];
      return {
        triggered: true,
        priority: RulePriority.AUTONOMY_PROGRESS, // 30
        action: ActionType.START_TASK,
        confidence: 0.90,
        payload: { taskId: readyTask.id },
        reason: {
          primary: 'START_READY_TASK',
          description: `Starting executable ready task "${readyTask.name}".`
        },
        evidence: {
          taskId: readyTask.id,
          taskName: readyTask.name
        },
        requiresEarthApproval: false
      };
    }

    return { triggered: false };
  }
}

export class CommunicationBlackoutRule {
  evaluate(obs) {
    if (obs.communication.communicationState === 'BLACKOUT') {
      return {
        triggered: true,
        priority: RulePriority.AUTONOMY_PROGRESS, // 30
        action: ActionType.CONTINUE_TASK,
        confidence: 0.85,
        reason: {
          primary: 'AUTONOMOUS_BLACKOUT_EXECUTION',
          description: 'Earth communication is in BLACKOUT; maintaining autonomous local mission execution.'
        },
        evidence: {
          communicationState: 'BLACKOUT',
          batteryLevel: obs.rover.batteryLevel
        },
        requiresEarthApproval: false
      };
    }

    return { triggered: false };
  }
}

export class EarthGuidanceRule {
  evaluate(obs) {
    if (obs.mission.status === 'UNKNOWN_ANOMALY' || obs.rover.health === 'CRITICAL') {
      return {
        triggered: true,
        priority: RulePriority.SAFETY_EMERGENCY,
        action: ActionType.REQUEST_EARTH_GUIDANCE,
        confidence: 0.95,
        reason: {
          primary: 'UNSOLVABLE_ANOMALY_EARTH_REQUIRED',
          description: 'Unresolvable mission state encountered. Requesting Earth Ground Control guidance.'
        },
        evidence: {
          missionStatus: obs.mission.status,
          roverHealth: obs.rover.health
        },
        requiresEarthApproval: true
      };
    }

    return { triggered: false };
  }
}
