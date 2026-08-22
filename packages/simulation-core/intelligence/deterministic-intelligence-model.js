/**
 * DETERMINISTIC INTELLIGENCE MODEL
 * Concrete deterministic implementation of IntelligenceModel abstraction.
 */

import { IntelligenceModel } from './intelligence-model.js';
import { AnomalyType, AnomalySeverity, RiskLevel } from './intelligence-types.js';

export class DeterministicIntelligenceModel extends IntelligenceModel {
  analyze(observation, history = []) {
    const anomalies = [];
    const battery = observation.rover ? observation.rover.batteryLevel : 0.94;
    const reserve = observation.constraints ? (observation.constraints.minimumBatteryReserve || 0.15) : 0.15;

    // Battery low / critical
    if (battery < 0.05) {
      anomalies.push({
        anomalyId: `ANO-BAT-CRIT-${Date.now()}`,
        type: AnomalyType.BATTERY_LOW,
        severity: AnomalySeverity.CRITICAL,
        source: 'BATTERY_MONITOR',
        detectedAt: Date.now(),
        evidence: { batteryLevel: battery, minimumReserve: reserve },
        confidence: 0.99,
        recommendedResponse: 'WAIT'
      });
    } else if (battery < reserve) {
      anomalies.push({
        anomalyId: `ANO-BAT-LOW-${Date.now()}`,
        type: AnomalyType.BATTERY_LOW,
        severity: AnomalySeverity.HIGH,
        source: 'BATTERY_MONITOR',
        detectedAt: Date.now(),
        evidence: { batteryLevel: battery, minimumReserve: reserve },
        confidence: 0.95,
        recommendedResponse: 'RETURN_TO_BASE'
      });
    }

    // Health degradation
    if (observation.rover && observation.rover.health !== 'NOMINAL') {
      anomalies.push({
        anomalyId: `ANO-HLT-${Date.now()}`,
        type: AnomalyType.ROVER_HEALTH_DEGRADATION,
        severity: AnomalySeverity.HIGH,
        source: 'HEALTH_MONITOR',
        detectedAt: Date.now(),
        evidence: { health: observation.rover.health },
        confidence: 0.95,
        recommendedResponse: 'PAUSE_MISSION'
      });
    }

    return anomalies;
  }

  predict(observation, horizonSeconds = 600) {
    const battery = observation.rover ? observation.rover.batteryLevel : 0.94;
    const ratePerSec = 0.0001; // deterministic consumption estimate
    const predictedBattery = Math.max(0, battery - (horizonSeconds * ratePerSec));
    const reserve = observation.constraints ? (observation.constraints.minimumBatteryReserve || 0.15) : 0.15;

    return {
      currentBattery: battery,
      predictedBattery: Math.round(predictedBattery * 1000) / 1000,
      horizonSeconds,
      reserveViolationExpected: predictedBattery < reserve,
      confidence: 0.90
    };
  }

  scoreRisk(observation, anomalies = []) {
    let score = 10.0; // Baseline low risk
    let level = RiskLevel.LOW;

    if (anomalies.some(a => a.severity === AnomalySeverity.CRITICAL)) {
      level = RiskLevel.CRITICAL;
      score = 95.0;
    } else if (anomalies.some(a => a.severity === AnomalySeverity.HIGH)) {
      level = RiskLevel.HIGH;
      score = 75.0;
    } else if (anomalies.length > 0) {
      level = RiskLevel.MEDIUM;
      score = 45.0;
    }

    return { score, level, confidence: 0.95 };
  }
}
