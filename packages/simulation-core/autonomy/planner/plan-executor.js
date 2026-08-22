/**
 * PLAN EXECUTOR
 * Executes multi-step mission plans ONE action at a time without bypassing Objective 5 SafetyValidator.
 */

import { PlanState, PlanActionState } from './planner-types.js';
import { SafetyValidator } from '../safety-validator.js';
import { AutonomyActionExecutor } from '../action-executor.js';
import { createAutonomyObservation } from '../autonomy-observation.js';

export class PlanExecutor {
  constructor(options = {}) {
    this.safetyValidator = options.safetyValidator || new SafetyValidator();
    this.actionExecutor = options.actionExecutor || new AutonomyActionExecutor();
    this.missionPlanner = options.missionPlanner || null;
  }

  /**
   * Executes the next pending/ready action in the plan through Objective 5 SafetyValidator.
   * @param {Object} plan MissionPlan
   * @param {Object} context { missionManager, rover, environment, dtnChannel }
   * @returns {Object} Execution result { success, action, validation, executionResult, plan, newPlan? }
   */
  executeNextStep(plan, context = {}) {
    if (!plan || !plan.actions || plan.actions.length === 0) {
      throw new TypeError('Invalid MissionPlan provided to PlanExecutor.');
    }

    if (plan.status === PlanState.COMPLETED || plan.status === PlanState.FAILED) {
      return { success: false, reason: `PLAN_ALREADY_${plan.status}`, plan };
    }

    const { missionManager, rover, environment, dtnChannel } = context;
    const observation = createAutonomyObservation(missionManager, rover, environment, dtnChannel);

    // Find next executable action
    const nextActionIndex = plan.actions.findIndex(
      a => a.status === PlanActionState.READY || a.status === PlanActionState.PENDING
    );

    if (nextActionIndex === -1) {
      plan.status = PlanState.COMPLETED;
      return { success: true, reason: 'ALL_ACTIONS_COMPLETED', plan };
    }

    const targetAction = plan.actions[nextActionIndex];
    plan.status = PlanState.EXECUTING;
    targetAction.status = PlanActionState.EXECUTING;

    // 1. MUST PASS THROUGH OBJECTIVE 5 SAFETY VALIDATOR
    const proposedDecision = {
      decisionId: `DEC-PLAN-${Date.now()}`,
      action: targetAction.actionType,
      payload: targetAction.parameters || {},
      reason: { primary: 'PLAN_EXECUTION_STEP', description: `Executing plan action ${targetAction.id}` }
    };

    const validation = this.safetyValidator.validate(proposedDecision, observation);

    if (!validation.valid) {
      targetAction.status = PlanActionState.FAILED;
      plan.status = PlanState.FAILED;

      let newPlan = null;
      if (this.missionPlanner) {
        newPlan = this.missionPlanner.replan(observation, plan, validation.rejectionReason);
      }

      return {
        success: false,
        action: targetAction,
        validation,
        executionResult: null,
        plan,
        newPlan,
        reason: validation.rejectionReason
      };
    }

    // 2. EXECUTE VIA OBJECTIVE 5 ACTION EXECUTOR
    const executionResult = this.actionExecutor.execute(validation.decision, context);

    if (executionResult.success) {
      targetAction.status = PlanActionState.COMPLETED;

      // Set next action to READY
      if (nextActionIndex + 1 < plan.actions.length) {
        plan.actions[nextActionIndex + 1].status = PlanActionState.READY;
      } else {
        plan.status = PlanState.COMPLETED;
      }

      return {
        success: true,
        action: targetAction,
        validation,
        executionResult,
        plan
      };
    } else {
      targetAction.status = PlanActionState.FAILED;
      plan.status = PlanState.FAILED;

      let newPlan = null;
      if (this.missionPlanner) {
        newPlan = this.missionPlanner.replan(observation, plan, executionResult.result.reason || 'ACTION_FAILED');
      }

      return {
        success: false,
        action: targetAction,
        validation,
        executionResult,
        plan,
        newPlan,
        reason: executionResult.result.reason || 'EXECUTION_FAILED'
      };
    }
  }
}
