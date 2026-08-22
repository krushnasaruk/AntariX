/**
 * RISK ASSESSMENT ENGINE
 * Evaluates operational risk following strict safety priority: Safety -> Battery/Health -> Environment -> Mission -> Comm.
 */

import { RiskLevel, AnomalySeverity } from './intelligence-types.js';

export class RiskAssessmentEngine {
  /**
   * Assesses operational risk level and score from observation and active anomalies.
   * @param {Object} observation Unified AutonomyObservation
   * @param {Array} anomalies Active detected anomalies
   * @returns {Object} Structured Risk Assessment
   */
  assess(observation, anomalies = []) {
    const factors = [];
    const criticalFactors = [];

    const battery = observation.rover ? observation.rover.batteryLevel : 0.94;
    const reserve = observation.constraints ? (observation.constraints.minimumBatteryReserve || 0.15) : 0.15;
    const health = observation.rover ? observation.rover.health : 'NOMINAL';
    const weather = observation.environment && observation.environment.weather ? observation.environment.weather.state : 'CLEAR';
    const commState = observation.communication ? observation.communication.communicationState : 'AVAILABLE';

    // 1. Safety & Battery Checks
    if (battery < 0.05) {
      criticalFactors.push('BATTERY_CRITICALLY_LOW');
      factors.push({ factor: 'Battery Level', detail: `Battery at ${(battery * 100).toFixed(1)}%`, risk: RiskLevel.CRITICAL });
    } else if (battery < reserve) {
      factors.push({ factor: 'Battery Reserve', detail: `Battery (${(battery * 100).toFixed(1)}%) below reserve (${(reserve * 100).toFixed(1)}%)`, risk: RiskLevel.HIGH });
    }

    if (health !== 'NOMINAL') {
      if (health === 'CRITICAL') criticalFactors.push('ROVER_HEALTH_CRITICAL');
      factors.push({ factor: 'Rover Health', detail: `Health is ${health}`, risk: health === 'CRITICAL' ? RiskLevel.CRITICAL : RiskLevel.HIGH });
    }

    // 2. Environmental Checks
    if (weather === 'DUST_STORM') {
      factors.push({ factor: 'Weather', detail: 'Active Dust Storm in progress', risk: RiskLevel.HIGH });
    } else if (weather === 'DUSTY') {
      factors.push({ factor: 'Weather', detail: 'Dusty environment reducing solar flux', risk: RiskLevel.MEDIUM });
    }

    // 3. Communication Checks
    if (commState === 'BLACKOUT') {
      factors.push({ factor: 'Communication', detail: 'Communication state is BLACKOUT', risk: RiskLevel.LOW });
    }

    // 4. Anomaly Severities
    const hasCriticalAnomaly = anomalies.some(a => a.severity === AnomalySeverity.CRITICAL);
    const hasHighAnomaly = anomalies.some(a => a.severity === AnomalySeverity.HIGH);
    const hasMediumAnomaly = anomalies.some(a => a.severity === AnomalySeverity.MEDIUM);

    if (hasCriticalAnomaly) criticalFactors.push('CRITICAL_ANOMALY_PRESENT');

    // Determine Overall Risk Level & Score
    let overallRisk = RiskLevel.LOW;
    let score = 15.0;
    let recommendedAction = 'CONTINUE_PLAN';

    if (criticalFactors.length > 0 || hasCriticalAnomaly) {
      overallRisk = RiskLevel.CRITICAL;
      score = 95.0;
      if (health === 'CRITICAL') {
        recommendedAction = 'REQUEST_EARTH_GUIDANCE';
      } else {
        recommendedAction = battery < 0.05 ? 'WAIT' : 'RETURN_TO_BASE';
      }
    } else if (hasHighAnomaly || battery < reserve || weather === 'DUST_STORM') {
      overallRisk = RiskLevel.HIGH;
      score = 75.0;
      recommendedAction = 'REPLAN';
    } else if (hasMediumAnomaly || weather === 'DUSTY') {
      overallRisk = RiskLevel.MEDIUM;
      score = 45.0;
      recommendedAction = 'SCAN_TERRAIN';
    } else {
      overallRisk = RiskLevel.LOW;
      score = 15.0;
      recommendedAction = 'CONTINUE_PLAN';
    }

    return {
      overallRisk,
      score: Math.round(score * 100) / 100,
      factors,
      criticalFactors,
      confidence: 0.95,
      recommendedAction
    };
  }
}
