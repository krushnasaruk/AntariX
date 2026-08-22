/**
 * DECISION HISTORY LOGGING
 * Records observations, decisions, safety validations, and execution results for auditability and replay.
 */

export class DecisionHistory {
  constructor() {
    this.history = [];
  }

  /**
   * Records a complete decision cycle record.
   * @param {Object} decision Proposed decision
   * @param {Object} validation Safety validation output
   * @param {Object} executionResult Action execution output
   */
  record(decision, validation, executionResult) {
    const entry = {
      recordId: `REC-${Date.now()}-${this.history.length + 1}`,
      timestamp: Date.now(),
      decision: { ...decision },
      validation: { ...validation },
      executionResult: { ...executionResult }
    };
    this.history.push(entry);
    return entry;
  }

  getHistory() {
    return [...this.history];
  }

  getLastDecision() {
    if (this.history.length === 0) return null;
    return this.history[this.history.length - 1];
  }

  clearHistory() {
    this.history = [];
  }
}
