/**
 * PYTHON LEARNING SERVICE ADAPTER
 * Connects Node.js Simulation Core to Python FastAPI AI Learning Engine over HTTP REST, with seamless fallback if service is offline.
 */

export class PythonLearningAdapter {
  constructor(options = {}) {
    this.serviceUrl = options.serviceUrl || process.env.AI_ENGINE_URL || 'http://localhost:8000';
    this.timeoutMs = options.timeoutMs || 2000;
  }

  /**
   * Submits completed/failed mission execution experience to Python AI Learning Engine.
   * @param {Object} experience MissionExperience record
   * @returns {Promise<Object>} Recorded experience or null if offline
   */
  async recordExperienceAsync(experience) {
    if (!experience || typeof experience !== 'object') {
      return null;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const response = await fetch(`${this.serviceUrl}/learn/experience`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(experience),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      // Service offline or timeout
    }

    return null;
  }

  /**
   * Requests adaptive planning recommendation based on historical experience memory.
   * @param {Object} observation Unified AutonomyObservation
   * @param {Object} currentPlan Active MissionPlan
   * @param {Array<string>} candidateStrategies List of candidate strategies
   * @returns {Promise<Object>} LearningAnalysisResponse
   */
  async requestAdaptiveRecommendationAsync(observation, currentPlan = null, candidateStrategies = []) {
    if (!observation || typeof observation !== 'object') {
      throw new TypeError('Invalid AutonomyObservation provided to PythonLearningAdapter.');
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      const payload = {
        observation,
        candidateStrategies: candidateStrategies.length > 0 ? candidateStrategies : [
          'SAFE_SAMPLE_ACQUISITION_AND_RETURN',
          'DIRECT_SAMPLE_COLLECTION',
          'ENERGY_CONSERVING_PATROL',
          'DUST_STORM_HOLDING'
        ]
      };

      const response = await fetch(`${this.serviceUrl}/learn/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }
    } catch (err) {
      // Service offline or timeout - fallback to cold-start response
    }

    return this.getFallbackColdStartResponse(candidateStrategies);
  }

  getFallbackColdStartResponse(candidateStrategies = []) {
    const defaultStrategy = candidateStrategies.length > 0 ? candidateStrategies[0] : 'SAFE_SAMPLE_ACQUISITION_AND_RETURN';
    return {
      timestamp: Date.now(),
      recommendation: {
        recommendedStrategy: defaultStrategy,
        confidence: 0.10,
        reason: 'Cold start fallback: Python AI learning service offline. Using baseline Objective 6 plan.',
        historicalEvidence: { sampleSize: 0, successRate: 0.0 },
        riskAdjustment: { batteryMarginIncrease: 0.0 },
        sampleSize: 0,
        evidenceQuality: 'NONE'
      },
      strategyPerformances: [],
      failurePatterns: [],
      statistics: { totalExperiences: 0, successfulCount: 0, failedCount: 0, overallSuccessRate: 0.0 }
    };
  }
}
