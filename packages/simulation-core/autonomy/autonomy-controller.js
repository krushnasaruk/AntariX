/**
 * AUTONOMY CONTROLLER
 * Coordinates one-step execution cycle: Observe -> Reason -> Decide -> Validate -> Execute -> Record.
 */

import { createAutonomyObservation } from './autonomy-observation.js';
import { AutonomousDecisionEngine } from './decision-engine.js';
import { SafetyValidator } from './safety-validator.js';
import { AutonomyActionExecutor } from './action-executor.js';
import { DecisionHistory } from './decision-history.js';

export class AutonomyController {
  constructor(context = {}) {
    this.missionManager = context.missionManager || null;
    this.rover = context.rover || null;
    this.environment = context.environment || null;
    this.dtnChannel = context.dtnChannel || null;

    this.decisionEngine = context.decisionEngine || new AutonomousDecisionEngine();
    this.safetyValidator = context.safetyValidator || new SafetyValidator();
    this.actionExecutor = context.actionExecutor || new AutonomyActionExecutor();
    this.decisionHistory = context.decisionHistory || new DecisionHistory();
  }

  /**
   * Executes ONE complete autonomy loop step deterministically without blocking Node.js.
   * @returns {Object} Cycle results
   */
  step() {
    // 1. Observe
    const observation = createAutonomyObservation(
      this.missionManager,
      this.rover,
      this.environment,
      this.dtnChannel
    );

    // 2. Reason & Decide
    const proposedDecision = this.decisionEngine.decide(observation);

    // 3. Safety Validate
    const validation = this.safetyValidator.validate(proposedDecision, observation);

    // 4. Execute
    const executionResult = this.actionExecutor.execute(validation.decision, {
      missionManager: this.missionManager,
      rover: this.rover,
      environment: this.environment,
      dtnChannel: this.dtnChannel
    });

    // 5. Record History
    const historyEntry = this.decisionHistory.record(proposedDecision, validation, executionResult);

    return {
      observation,
      proposedDecision,
      validation,
      executionResult,
      historyEntry
    };
  }
}
