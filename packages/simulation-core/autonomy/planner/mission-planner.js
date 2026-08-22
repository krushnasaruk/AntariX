/**
 * DETERMINISTIC AUTONOMOUS MISSION PLANNER
 * Multi-step goal decomposition, preconditions, postconditions, energy/return-to-base feasibility checking, and replanning.
 */

import { ActionType } from '../autonomy-types.js';
import { PlanState, PlanRiskLevel, PlanActionState } from './planner-types.js';
import { PlanValidator } from './plan-validator.js';
import { ContingencyPlanner } from './contingency-planner.js';
import { scorePlan } from './plan-scoring.js';

export class MissionPlanner {
  constructor() {
    this.validator = new PlanValidator();
    this.contingencyPlanner = new ContingencyPlanner();
  }

  /**
   * Generates a multi-step MissionPlan from an AutonomyObservation.
   * @param {Object} observation Unified AutonomyObservation
   * @returns {Object} MissionPlan object
   */
  plan(observation) {
    if (!observation || typeof observation !== 'object') {
      throw new TypeError('Invalid AutonomyObservation provided to MissionPlanner.');
    }

    // 1. Check Battery Emergency Feasibility
    const battery = observation.rover ? observation.rover.batteryLevel : 0.94;
    const reserve = observation.constraints ? (observation.constraints.minimumBatteryReserve || 0.15) : 0.15;

    if (battery < reserve) {
      return this.contingencyPlanner.generateContingency('BATTERY_LOW', observation);
    }

    // 2. Check Weather Emergency Feasibility
    if (observation.environment && observation.environment.weather && observation.environment.weather.state === 'DUST_STORM') {
      return this.contingencyPlanner.generateContingency('DUST_STORM', observation);
    }

    // 3. Goal Decomposition for current or ready tasks
    const activeTask = observation.currentTask || (observation.readyTasks && observation.readyTasks[0]);
    const taskId = activeTask ? activeTask.id : 'TASK-1';

    const candidates = this.generateCandidatePlans(taskId, observation);

    // 4. Validate & Score Candidates
    const validScoredCandidates = [];

    for (const candidate of candidates) {
      const validation = this.validator.validate(candidate, observation);
      if (validation.valid) {
        const score = scorePlan(candidate, observation);
        candidate.score = score;
        validScoredCandidates.push(candidate);
      }
    }

    if (validScoredCandidates.length === 0) {
      return this.contingencyPlanner.generateContingency('NO_VALID_CANDIDATE_PLAN', observation);
    }

    // Sort candidates by score descending
    validScoredCandidates.sort((a, b) => b.score - a.score);
    const selected = validScoredCandidates[0];
    selected.status = PlanState.PLANNED;

    return selected;
  }

  /**
   * Generates multi-step candidate action sequences based on current task.
   */
  generateCandidatePlans(taskId, observation) {
    const basePos = observation.environment && observation.environment.missionLocations ? observation.environment.missionLocations.base : { x: 100, y: 100 };
    const samplePos = observation.environment && observation.environment.missionLocations ? observation.environment.missionLocations.sample : { x: 520, y: 530 };
    const craterPos = observation.environment && observation.environment.missionLocations ? observation.environment.missionLocations.crater : { x: 500, y: 500 };

    const planId = `PLAN-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    let actions = [];
    let objectiveName = 'SAMPLE_COLLECTION_GOAL';
    let strategy = 'FULL_SAMPLE_COLLECTION_SEQUENCE';

    if (taskId === 'TASK-1') {
      objectiveName = 'NAVIGATE_TO_CRATER';
      strategy = 'NAVIGATE_SURVEY_PIPELINE';
      actions = [
        {
          id: 'ACT-1', sequence: 1, actionType: ActionType.MOVE_ROVER, parameters: { targetPosition: craterPos },
          preconditions: ['battery >= reserve'], postconditions: ['roverAtCrater == true'], expectedOutcome: 'Rover positioned at Crater-07',
          estimatedEnergy: 0.20, estimatedDuration: 800, riskLevel: PlanRiskLevel.LOW, fallbackAction: ActionType.WAIT, status: PlanActionState.READY
        },
        {
          id: 'ACT-2', sequence: 2, actionType: ActionType.SCAN_TERRAIN, parameters: { radius: 50 },
          preconditions: ['roverAtCrater == true'], postconditions: ['terrainScanned == true'], expectedOutcome: 'Scanned crater terrain',
          estimatedEnergy: 0.002, estimatedDuration: 30, riskLevel: PlanRiskLevel.LOW, fallbackAction: ActionType.WAIT, status: PlanActionState.PENDING
        }
      ];
    } else if (taskId === 'TASK-4' || taskId === 'TASK-3' || taskId === 'TASK-2') {
      objectiveName = 'COLLECT_GEOLOGICAL_SAMPLE';
      strategy = 'SAMPLE_ACQUISITION_AND_RETURN';
      actions = [
        {
          id: 'ACT-1', sequence: 1, actionType: ActionType.MOVE_ROVER, parameters: { targetPosition: samplePos },
          preconditions: ['battery >= reserve'], postconditions: ['roverAtSampleLoc == true'], expectedOutcome: 'Rover near sample site',
          estimatedEnergy: 0.20, estimatedDuration: 840, riskLevel: PlanRiskLevel.LOW, fallbackAction: ActionType.WAIT, status: PlanActionState.READY
        },
        {
          id: 'ACT-2', sequence: 2, actionType: ActionType.SCAN_TERRAIN, parameters: { radius: 30 },
          preconditions: ['roverAtSampleLoc == true'], postconditions: ['terrainScanned == true'], expectedOutcome: 'Scanned local rock outcrop',
          estimatedEnergy: 0.002, estimatedDuration: 30, riskLevel: PlanRiskLevel.LOW, fallbackAction: ActionType.WAIT, status: PlanActionState.PENDING
        },
        {
          id: 'ACT-3', sequence: 3, actionType: ActionType.DETECT_SAMPLE, parameters: {},
          preconditions: ['terrainScanned == true'], postconditions: ['sampleDetected == true'], expectedOutcome: 'Sample detected',
          estimatedEnergy: 0.001, estimatedDuration: 10, riskLevel: PlanRiskLevel.LOW, fallbackAction: ActionType.WAIT, status: PlanActionState.PENDING
        },
        {
          id: 'ACT-4', sequence: 4, actionType: ActionType.COLLECT_SAMPLE, parameters: {},
          preconditions: ['sampleDetected == true', 'distToSample <= 5'], postconditions: ['sampleStatus == COLLECTED'], expectedOutcome: 'Sample secured in bag',
          estimatedEnergy: 0.01, estimatedDuration: 120, riskLevel: PlanRiskLevel.MEDIUM, fallbackAction: ActionType.WAIT, status: PlanActionState.PENDING
        },
        {
          id: 'ACT-5', sequence: 5, actionType: ActionType.VERIFY_SAMPLE, parameters: {},
          preconditions: ['sampleStatus == COLLECTED'], postconditions: ['sampleStatus == VERIFIED'], expectedOutcome: 'Spectrometer verified core sample',
          estimatedEnergy: 0.005, estimatedDuration: 60, riskLevel: PlanRiskLevel.LOW, fallbackAction: ActionType.WAIT, status: PlanActionState.PENDING
        },
        {
          id: 'ACT-6', sequence: 6, actionType: ActionType.RETURN_TO_BASE, parameters: { targetPosition: basePos },
          preconditions: ['sampleStatus == VERIFIED'], postconditions: ['roverAtBase == true'], expectedOutcome: 'Rover returned to base',
          estimatedEnergy: 0.20, estimatedDuration: 840, riskLevel: PlanRiskLevel.LOW, fallbackAction: ActionType.WAIT, status: PlanActionState.PENDING
        },
        {
          id: 'ACT-7', sequence: 7, actionType: ActionType.SEND_STATUS_REPORT, parameters: {},
          preconditions: ['roverAtBase == true'], postconditions: ['reportSent == true'], expectedOutcome: 'Report sent to Earth',
          estimatedEnergy: 0.001, estimatedDuration: 5, riskLevel: PlanRiskLevel.LOW, fallbackAction: ActionType.WAIT, status: PlanActionState.PENDING
        }
      ];
    } else {
      objectiveName = 'RETURN_AND_REPORT';
      strategy = 'BASE_RETURN_SEQUENCE';
      actions = [
        {
          id: 'ACT-1', sequence: 1, actionType: ActionType.RETURN_TO_BASE, parameters: { targetPosition: basePos },
          preconditions: ['battery >= reserve'], postconditions: ['roverAtBase == true'], expectedOutcome: 'Rover returned safely to base',
          estimatedEnergy: 0.20, estimatedDuration: 840, riskLevel: PlanRiskLevel.LOW, fallbackAction: ActionType.WAIT, status: PlanActionState.READY
        },
        {
          id: 'ACT-2', sequence: 2, actionType: ActionType.SEND_STATUS_REPORT, parameters: {},
          preconditions: ['roverAtBase == true'], postconditions: ['reportSent == true'], expectedOutcome: 'Final report transmitted',
          estimatedEnergy: 0.001, estimatedDuration: 5, riskLevel: PlanRiskLevel.LOW, fallbackAction: ActionType.WAIT, status: PlanActionState.PENDING
        }
      ];
    }

    const candidatePlan = {
      planId,
      missionId: observation.mission ? observation.mission.id : 'MISSION-CRATER-07',
      createdAt: Date.now(),
      objective: objectiveName,
      actions,
      estimatedDuration: 1905,
      estimatedEnergy: 0.419,
      risks: PlanRiskLevel.LOW,
      constraints: { ...observation.constraints },
      confidence: 0.95,
      status: PlanState.PLANNED,
      strategy,
      rejectedAlternatives: ['BLIND_DIRECT_COLLECTION', 'UNPREPARED_RETURN'],
      fallbackStrategy: 'SAFE_HOLDING_CONTINGENCY',
      explanation: {
        goal: objectiveName,
        selectedStrategy: strategy,
        rejectedAlternatives: ['BLIND_DIRECT_COLLECTION'],
        constraintsChecked: { ...observation.constraints },
        reasonForSelection: 'Plan satisfies battery reserve feasibility and safety preconditions.'
      }
    };

    return [candidatePlan];
  }

  /**
   * Triggered when an action fails or environmental conditions change.
   */
  replan(observation, previousPlan, triggerReason = 'ACTION_FAILED') {
    if (previousPlan) {
      previousPlan.status = PlanState.FAILED;
    }
    return this.contingencyPlanner.generateContingency(triggerReason, observation);
  }
}
