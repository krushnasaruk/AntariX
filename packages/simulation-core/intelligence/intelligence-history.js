/**
 * INTELLIGENCE HISTORY STORAGE & PREDICTION ERROR TRACKING
 * Records intelligence cycles, stores predictions vs actual outcomes, and calculates prediction errors.
 */

export class IntelligenceHistory {
  constructor() {
    this.records = [];
  }

  /**
   * Records an intelligence cycle report and observation snapshot.
   */
  record(report, observation) {
    const entry = {
      recordId: `INT-REC-${Date.now()}-${this.records.length + 1}`,
      timestamp: Date.now(),
      report: { ...report },
      observation: { ...observation }
    };
    this.records.push(entry);
    return entry;
  }

  getHistory() {
    return [...this.records];
  }

  getLastReport() {
    if (this.records.length === 0) return null;
    return this.records[this.records.length - 1].report;
  }

  /**
   * Calculates prediction error between predicted battery and actual observed battery.
   * @param {number} predictedBattery 
   * @param {number} actualBattery 
   * @returns {number} Absolute error deviation
   */
  calculatePredictionError(predictedBattery, actualBattery) {
    if (typeof predictedBattery !== 'number' || typeof actualBattery !== 'number') {
      return 0.0;
    }
    return Math.round(Math.abs(predictedBattery - actualBattery) * 1000) / 1000;
  }

  clearHistory() {
    this.records = [];
  }
}
