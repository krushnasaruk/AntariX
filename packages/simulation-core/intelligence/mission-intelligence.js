/**
 * MISSION INTELLIGENCE ENGINE
 * Aggregates anomaly detection, risk assessment, state prediction, and mission health metrics into explainable reports.
 */

import { AnomalyDetector } from './anomaly-detector.js';
import { RiskAssessmentEngine } from './risk-assessment.js';
import { MissionPredictionEngine } from './prediction-engine.js';
import { IntelligenceHistory } from './intelligence-history.js';

export class MissionIntelligenceEngine {
  constructor(options = {}) {
    this.anomalyDetector = options.anomalyDetector || new AnomalyDetector();
    this.riskEngine = options.riskEngine || new RiskAssessmentEngine();
    this.predictionEngine = options.predictionEngine || new MissionPredictionEngine();
    this.history = options.history || new IntelligenceHistory();
    this.planner = options.planner || null;
  }

  /**
   * Generates a comprehensive MissionIntelligenceReport from current observation and plan state.
   * @param {Object} observation Unified AutonomyObservation
   * @param {Object} currentPlan Active MissionPlan
   * @returns {Object} MissionIntelligenceReport
   */
  generateReport(observation, currentPlan = null) {
    if (!observation || typeof observation !== 'object') {
      throw new TypeError('Invalid AutonomyObservation provided to MissionIntelligenceEngine.');
    }

    const pastRecords = this.history.getHistory();

    // 1. Anomaly Detection
    const anomalies = this.anomalyDetector.detect(observation, pastRecords, currentPlan);

    // 2. Risk Assessment
    const riskAssessment = this.riskEngine.assess(observation, anomalies);

    // 3. State Prediction (600s horizon)
    const predictions = this.predictionEngine.predict(observation, 600);

    // 4. Mission Health Score
    const batteryLevel = observation.rover ? observation.rover.batteryLevel : 0.94;
    const roverHealthState = observation.rover ? observation.rover.health : 'NOMINAL';
    const commState = observation.communication ? observation.communication.communicationState : 'AVAILABLE';
    const weatherState = observation.environment && observation.environment.weather ? observation.environment.weather.state : 'CLEAR';
    const progress = observation.missionProgress || 0.0;

    const batteryHealth = Math.min(1.0, batteryLevel);
    const roverHealth = roverHealthState === 'NOMINAL' ? 1.0 : (roverHealthState === 'CRITICAL' ? 0.0 : 0.5);
    const communicationHealth = commState === 'AVAILABLE' ? 1.0 : 0.6;
    const environmentHealth = weatherState === 'CLEAR' ? 1.0 : (weatherState === 'DUST_STORM' ? 0.2 : 0.6);
    const missionProgressHealth = Math.min(1.0, progress / 100);

    const healthScore = Math.round(((batteryHealth + roverHealth + communicationHealth + environmentHealth + missionProgressHealth) / 5) * 100) / 100;

    const missionHealth = {
      score: healthScore,
      batteryHealth: Math.round(batteryHealth * 100) / 100,
      roverHealth: Math.round(roverHealth * 100) / 100,
      communicationHealth: Math.round(communicationHealth * 100) / 100,
      environmentHealth: Math.round(environmentHealth * 100) / 100,
      missionProgressHealth: Math.round(missionProgressHealth * 100) / 100
    };

    // 5. Formulate Recommendations
    const recommendedActions = [riskAssessment.recommendedAction];
    let plannerAction = 'CONTINUE_PLAN';

    if (riskAssessment.overallRisk === 'CRITICAL' || riskAssessment.overallRisk === 'HIGH') {
      plannerAction = riskAssessment.recommendedAction;
      if (this.planner && currentPlan && plannerAction === 'REPLAN') {
        this.planner.replan(observation, currentPlan, 'INTELLIGENCE_HIGH_RISK_RECOMPUTE');
      }
    }

    const report = {
      timestamp: Date.now(),
      missionId: observation.mission ? observation.mission.id : 'MISSION-CRATER-07',
      currentState: observation.mission ? observation.mission.status : 'IN_PROGRESS',
      anomalies,
      riskAssessment,
      predictions,
      missionHealth,
      recommendedActions,
      plannerRecommendation: {
        recommendedAction: plannerAction,
        reason: riskAssessment.factors.map(f => f.detail).join('; ') || 'All telemetry nominal.',
        evidence: anomalies.map(a => a.type)
      },
      confidence: 0.95,
      explanation: {
        primary: riskAssessment.recommendedAction,
        description: `Mission Intelligence evaluated ${anomalies.length} active anomalies and determined risk level to be ${riskAssessment.overallRisk}.`,
        evidence: anomalies.map(a => a.evidence)
      }
    };

    // Record report in history
    this.history.record(report, observation);

    return report;
  }
}
