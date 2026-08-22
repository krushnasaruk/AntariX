/**
 * AUTONOMOUS DECISION ENGINE
 * Deterministic, rule-based reasoning engine following strict safety hierarchy.
 */

import { ActionType, RulePriority } from './autonomy-types.js';
import {
  SafetyBatteryRule,
  RoverHealthRule,
  ObstacleSafetyRule,
  HazardSafetyRule,
  SampleCollectionRule,
  MissionProgressRule,
  CommunicationBlackoutRule,
  EarthGuidanceRule
} from './decision-rules.js';

export class AutonomousDecisionEngine {
  constructor(customRules = null) {
    this.rules = customRules || [
      new SafetyBatteryRule(),
      new RoverHealthRule(),
      new ObstacleSafetyRule(),
      new HazardSafetyRule(),
      new SampleCollectionRule(),
      new MissionProgressRule(),
      new CommunicationBlackoutRule(),
      new EarthGuidanceRule()
    ];
  }

  /**
   * Evaluates observation against rules and returns highest priority decision.
   * @param {Object} observation Unified AutonomyObservation
   * @returns {Object} Structured Decision
   */
  decide(observation) {
    if (!observation || typeof observation !== 'object') {
      throw new TypeError('Invalid AutonomyObservation provided to AutonomousDecisionEngine.');
    }

    const candidateResults = [];

    for (const rule of this.rules) {
      try {
        const result = rule.evaluate(observation);
        if (result && result.triggered) {
          candidateResults.push(result);
        }
      } catch (err) {
        console.error('Error evaluating rule:', err);
      }
    }

    // Sort by priority descending (higher priority first; if equal, higher confidence first)
    candidateResults.sort((a, b) => {
      if (b.priority !== a.priority) {
        return b.priority - a.priority;
      }
      return b.confidence - a.confidence;
    });

    const selected = candidateResults[0] || {
      action: ActionType.WAIT,
      priority: RulePriority.AUTONOMY_PROGRESS,
      confidence: 0.80,
      reason: {
        primary: 'NO_ACTION_REQUIRED',
        description: 'No safety or task rules triggered. Rover waiting for next tick.'
      },
      requiresEarthApproval: false
    };

    return {
      decisionId: `DEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: Date.now(),
      action: selected.action,
      payload: selected.payload || {},
      reason: selected.reason,
      confidence: selected.confidence,
      priority: selected.priority,
      expectedOutcome: `Execute action ${selected.action}`,
      constraintsChecked: { ...observation.constraints },
      requiresEarthApproval: Boolean(selected.requiresEarthApproval)
    };
  }
}

export const AutonomyDecisionEngine = AutonomousDecisionEngine;
