/**
 * PYTHON INTELLIGENCE SERVICE ADAPTER
 * Connects Node.js Simulation Core to Python FastAPI AI Service over HTTP REST, with seamless fallback to JS engine if service is offline.
 */

import { MissionIntelligenceEngine } from './mission-intelligence.js';

export class PythonIntelligenceAdapter {
  constructor(options = {}) {
    this.serviceUrl = options.serviceUrl || process.env.AI_ENGINE_URL || 'http://localhost:8000';
    this.jsFallbackEngine = options.jsFallbackEngine || new MissionIntelligenceEngine();
    this.timeoutMs = options.timeoutMs || 2000;
  }

  /**
   * Generates mission intelligence report by contacting Python AI Service, falling back to JS engine if offline.
   * @param {Object} observation Unified AutonomyObservation
   * @param {Object} currentPlan Active MissionPlan
   * @returns {Promise<Object>} MissionIntelligenceReport
   */
  async generateReportAsync(observation, currentPlan = null) {
    if (!observation || typeof observation !== 'object') {
      throw new TypeError('Invalid AutonomyObservation provided to PythonIntelligenceAdapter.');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(observation),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const report = await response.json();
        return report;
      }
    } catch (err) {
      // Service offline or timeout - fallback to JS engine
    }

    return this.generateReportSync(observation, currentPlan);
  }

  /**
   * Generates mission intelligence report synchronously using embedded JS engine.
   * @param {Object} observation Unified AutonomyObservation
   * @param {Object} currentPlan Active MissionPlan
   * @returns {Object} MissionIntelligenceReport
   */
  generateReportSync(observation, currentPlan = null) {
    return this.jsFallbackEngine.generateReport(observation, currentPlan);
  }
}
