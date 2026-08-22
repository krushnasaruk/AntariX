/**
 * CONTINGENCY PLANNER
 * Generates fallback contingency plans for battery warnings, obstacle blockages, dust storms, and action failures.
 */

import { ActionType } from '../autonomy-types.js';
import { PlanState, PlanRiskLevel, PlanActionState } from './planner-types.js';

export class ContingencyPlanner {
  /**
   * Generates a contingency MissionPlan based on trigger reason and observation.
   * @param {string} triggerReason 
   * @param {Object} observation 
   * @returns {Object} Contingency MissionPlan
   */
  generateContingency(triggerReason, observation) {
    const basePos = observation.environment && observation.environment.missionLocations ? observation.environment.missionLocations.base : { x: 100, y: 100 };
    const roverPos = observation.rover ? observation.rover.position : { x: 100, y: 100 };

    const planId = `PLAN-CONTINGENCY-${Date.now()}`;
    let actions = [];
    let risk = PlanRiskLevel.LOW;
    let strategy = 'SAFE_RECOVERY';

    if (triggerReason && (triggerReason.includes('BATTERY') || triggerReason.includes('RESERVE'))) {
      strategy = 'EMERGENCY_RETURN_TO_BASE';
      risk = PlanRiskLevel.HIGH;
      actions = [
        {
          id: 'ACT-C1',
          sequence: 1,
          actionType: ActionType.RETURN_TO_BASE,
          parameters: { targetPosition: basePos },
          preconditions: ['batteryLevel > 0'],
          expectedOutcome: 'Rover safe at base',
          estimatedEnergy: 0.08,
          estimatedDuration: 1200,
          riskLevel: PlanRiskLevel.HIGH,
          fallbackAction: ActionType.WAIT,
          status: PlanActionState.READY
        }
      ];
    } else if (triggerReason === 'DUST_STORM') {
      strategy = 'DUST_STORM_HOLDING';
      risk = PlanRiskLevel.MEDIUM;
      actions = [
        {
          id: 'ACT-C1',
          sequence: 1,
          actionType: ActionType.WAIT,
          parameters: { durationSeconds: 1800 },
          preconditions: [],
          expectedOutcome: 'Rover waiting out storm',
          estimatedEnergy: 0.001,
          estimatedDuration: 1800,
          riskLevel: PlanRiskLevel.LOW,
          fallbackAction: ActionType.WAIT,
          status: PlanActionState.READY
        }
      ];
    } else {
      // OBSTACLE_BLOCKED / ACTION_FAILED
      strategy = 'OBSTACLE_REOBSERVE_DETOUR';
      risk = PlanRiskLevel.MEDIUM;
      actions = [
        {
          id: 'ACT-C1',
          sequence: 1,
          actionType: ActionType.SCAN_TERRAIN,
          parameters: { radius: 50 },
          preconditions: [],
          expectedOutcome: 'Scanned clear detour path',
          estimatedEnergy: 0.002,
          estimatedDuration: 30,
          riskLevel: PlanRiskLevel.LOW,
          fallbackAction: ActionType.WAIT,
          status: PlanActionState.READY
        },
        {
          id: 'ACT-C2',
          sequence: 2,
          actionType: ActionType.MOVE_ROVER,
          parameters: { targetPosition: { x: roverPos.x + 10, y: roverPos.y + 10 } },
          preconditions: ['pathScanned == true'],
          expectedOutcome: 'Bypassed obstacle',
          estimatedEnergy: 0.01,
          estimatedDuration: 60,
          riskLevel: PlanRiskLevel.MEDIUM,
          fallbackAction: ActionType.WAIT,
          status: PlanActionState.PENDING
        }
      ];
    }

    return {
      planId,
      missionId: observation.mission ? observation.mission.id : 'MISSION-CRATER-07',
      createdAt: Date.now(),
      objective: 'SAFE_CONTINGENCY_RECOVERY',
      actions,
      estimatedDuration: 1200,
      estimatedEnergy: 0.05,
      risks: risk,
      constraints: { ...observation.constraints },
      confidence: 0.90,
      status: PlanState.PLANNED,
      strategy,
      rejectedAlternatives: ['UNSAFE_CONTINUATION'],
      fallbackStrategy: 'WAIT',
      explanation: {
        reason: triggerReason,
        description: `Contingency plan generated due to ${triggerReason}.`
      }
    };
  }
}
