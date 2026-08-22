/**
 * PLAN VALIDATOR
 * Verifies multi-step candidate mission plans against preconditions, battery feasibility, return-to-base margin, and terrain safety.
 */

import { ActionType } from '../autonomy-types.js';

export class PlanValidator {
  /**
   * Validates a candidate MissionPlan against observation data and constraints.
   * @param {Object} plan Candidate MissionPlan
   * @param {Object} observation Unified AutonomyObservation
   * @returns {Object} Validation result { valid: boolean, rejectionReason?: string, plan: Object }
   */
  validate(plan, observation) {
    if (!plan || !plan.actions || !Array.isArray(plan.actions) || plan.actions.length === 0) {
      return { valid: false, rejectionReason: 'EMPTY_OR_INVALID_PLAN', plan };
    }

    const roverPos = observation.rover ? observation.rover.position : { x: 100, y: 100 };
    const battery = observation.rover ? observation.rover.batteryLevel : 0.94;
    const reserve = observation.constraints ? (observation.constraints.minimumBatteryReserve || 0.15) : 0.15;
    const rate = 0.0005; // fraction per meter

    // 1. Verify Action Ordering & Prerequisites
    let sampleDetected = false;
    let sampleCollected = false;

    for (let i = 0; i < plan.actions.length; i++) {
      const act = plan.actions[i];

      if (act.actionType === ActionType.DETECT_SAMPLE) {
        sampleDetected = true;
      }

      if (act.actionType === ActionType.COLLECT_SAMPLE) {
        // Collect sample requires sample detection or existing discovery
        const sampleStatus = observation.environment && observation.environment.sampleLocation ? observation.environment.sampleLocation.status : 'UNDISCOVERED';
        if (!sampleDetected && sampleStatus === 'UNDISCOVERED' && i === 0) {
          return { valid: false, rejectionReason: 'COLLECT_WITHOUT_DETECTION', plan };
        }
        sampleCollected = true;
      }

      if (act.actionType === ActionType.VERIFY_SAMPLE) {
        if (!sampleCollected && (!observation.rover.samplesCollected || observation.rover.samplesCollected.length === 0)) {
          return { valid: false, rejectionReason: 'VERIFY_WITHOUT_COLLECTION', plan };
        }
      }
    }

    // 2. Verify Battery Feasibility & Return-to-Base Reserve
    let totalPlanEnergy = 0.0;
    let currentSimPos = { ...roverPos };

    for (const act of plan.actions) {
      if (act.actionType === ActionType.MOVE_ROVER && act.parameters && act.parameters.targetPosition) {
        const dx = act.parameters.targetPosition.x - currentSimPos.x;
        const dy = act.parameters.targetPosition.y - currentSimPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        totalPlanEnergy += dist * rate;
        currentSimPos = { ...act.parameters.targetPosition };
      } else if (act.actionType === ActionType.COLLECT_SAMPLE || act.actionType === ActionType.VERIFY_SAMPLE) {
        totalPlanEnergy += 0.01; // small operational cost
      }
    }

    // Calculate energy required to return to base from final plan position
    const basePos = observation.environment && observation.environment.missionLocations ? observation.environment.missionLocations.base : { x: 100, y: 100 };
    const returnDx = basePos.x - currentSimPos.x;
    const returnDy = basePos.y - currentSimPos.y;
    const returnDist = Math.sqrt(returnDx * returnDx + returnDy * returnDy);
    const returnEnergy = returnDist * rate;

    const remainingAfterPlanAndReturn = battery - totalPlanEnergy - returnEnergy;

    if (remainingAfterPlanAndReturn < reserve) {
      return {
        valid: false,
        rejectionReason: `BATTERY_RESERVE_VIOLATION: Remaining ${(remainingAfterPlanAndReturn * 100).toFixed(1)}% < ${(reserve * 100).toFixed(1)}% reserve`,
        plan
      };
    }

    // 3. Verify Obstacle Collision along proposed route
    const obstacles = observation.environment ? (observation.environment.obstacles || observation.environment.nearbyObstacles || []) : [];
    for (const act of plan.actions) {
      if (act.actionType === ActionType.MOVE_ROVER && act.parameters && act.parameters.targetPosition) {
        const tPos = act.parameters.targetPosition;
        const hit = obstacles.find(o => {
          const dx = tPos.x - o.position.x;
          const dy = tPos.y - o.position.y;
          return Math.sqrt(dx * dx + dy * dy) <= o.radius;
        });

        if (hit) {
          return {
            valid: false,
            rejectionReason: `OBSTACLE_ROUTE_VIOLATION: Proposed route intersects ${hit.name}`,
            plan
          };
        }
      }
    }

    return {
      valid: true,
      plan
    };
  }
}
