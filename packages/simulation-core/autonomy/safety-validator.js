/**
 * SAFETY VALIDATOR
 * Verifies proposed action decisions against physical constraints before execution.
 */

import { ActionType, RulePriority } from './autonomy-types.js';

export class SafetyValidator {
  /**
   * Validates a proposed decision against physical observations and constraints.
   * @param {Object} decision Proposed decision
   * @param {Object} observation Unified AutonomyObservation
   * @returns {Object} Validation result { valid: boolean, decision: Object, rejectionReason?: string }
   */
  validate(decision, observation) {
    if (!decision || !decision.action) {
      return {
        valid: false,
        rejectionReason: 'INVALID_DECISION_OBJECT',
        decision: this.generateFallbackDecision('INVALID_DECISION_OBJECT')
      };
    }

    // 1. Check Rover Status & Health
    if (observation.rover.status === 'DISABLED' && decision.action === ActionType.MOVE_ROVER) {
      return {
        valid: false,
        rejectionReason: 'ROVER_DISABLED',
        decision: this.generateFallbackDecision('ROVER_DISABLED', ActionType.WAIT)
      };
    }

    // 2. Validate MOVE_ROVER Action
    if (decision.action === ActionType.MOVE_ROVER) {
      const targetPos = decision.payload ? decision.payload.targetPosition : null;

      if (targetPos) {
        // Check obstacle collisions
        const obstacles = observation.environment.nearbyObstacles || [];
        const collision = obstacles.find(o => {
          const dx = targetPos.x - o.position.x;
          const dy = targetPos.y - o.position.y;
          return Math.sqrt(dx * dx + dy * dy) <= o.radius;
        });

        if (collision) {
          return {
            valid: false,
            rejectionReason: `OBSTACLE_COLLISION_PROPOSED: ${collision.name}`,
            decision: this.generateFallbackDecision(`OBSTACLE_COLLISION: ${collision.name}`, ActionType.WAIT)
          };
        }
      }

      // Check battery reserve violation when moving away from base
      const reserve = observation.constraints.minimumBatteryReserve || 0.15;
      if (observation.rover.batteryLevel < reserve) {
        return {
          valid: false,
          rejectionReason: 'BATTERY_BELOW_MINIMUM_RESERVE',
          decision: this.generateFallbackDecision('BATTERY_BELOW_RESERVE', ActionType.RETURN_TO_BASE)
        };
      }
    }

    // 3. Validate COLLECT_SAMPLE Action
    if (decision.action === ActionType.COLLECT_SAMPLE) {
      const sampleLoc = observation.environment.missionLocations ? observation.environment.missionLocations.sample : { x: 520, y: 530 };
      const dx = sampleLoc.x - observation.rover.position.x;
      const dy = sampleLoc.y - observation.rover.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 5) {
        return {
          valid: false,
          rejectionReason: `SAMPLE_OUT_OF_RANGE: ${dist.toFixed(2)}m > 5m`,
          decision: this.generateFallbackDecision('SAMPLE_OUT_OF_RANGE', ActionType.MOVE_ROVER, { targetPosition: sampleLoc })
        };
      }

      if (observation.rover.storageUsed >= observation.rover.storageCapacity) {
        return {
          valid: false,
          rejectionReason: 'STORAGE_FULL',
          decision: this.generateFallbackDecision('STORAGE_FULL', ActionType.RETURN_TO_BASE)
        };
      }
    }

    return {
      valid: true,
      decision
    };
  }

  generateFallbackDecision(reason, action = ActionType.WAIT, payload = {}) {
    return {
      decisionId: `DEC-FALLBACK-${Date.now()}`,
      timestamp: Date.now(),
      action,
      payload,
      reason: {
        primary: 'SAFETY_VALIDATION_REJECTION',
        description: `Safety validator rejected original proposal due to: ${reason}. Falling back to safe alternative.`
      },
      confidence: 0.99,
      priority: RulePriority.SAFETY_EMERGENCY,
      expectedOutcome: `Execute fallback action ${action}`,
      requiresEarthApproval: false
    };
  }
}
