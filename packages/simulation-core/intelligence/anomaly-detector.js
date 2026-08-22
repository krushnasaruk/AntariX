/**
 * ANOMALY DETECTOR
 * Deterministic detection of battery anomalies, health degradation, movement deviations, hazards, weather, and mission stalls.
 */

import { AnomalyType, AnomalySeverity } from './intelligence-types.js';

export class AnomalyDetector {
  constructor(options = {}) {
    this.stallThresholdSeconds = options.stallThresholdSeconds || 500;
  }

  /**
   * Detects active anomalies from unified observation, historical trajectory, and plan state.
   * @param {Object} observation Unified AutonomyObservation
   * @param {Array} history Historical cycle records
   * @param {Object} currentPlan Current MissionPlan
   * @returns {Array} List of detected anomalies
   */
  detect(observation, history = [], currentPlan = null) {
    if (!observation || typeof observation !== 'object') {
      return [];
    }

    const anomalies = [];
    const battery = observation.rover ? observation.rover.batteryLevel : 0.94;
    const reserve = observation.constraints ? (observation.constraints.minimumBatteryReserve || 0.15) : 0.15;
    const health = observation.rover ? observation.rover.health : 'NOMINAL';
    const weatherState = observation.environment && observation.environment.weather ? observation.environment.weather.state : 'CLEAR';
    const commState = observation.communication ? observation.communication.communicationState : 'AVAILABLE';

    // 1. Battery Low & Critical
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

    // 2. Battery Drain Rate Anomaly (Compare historical records if available)
    if (history.length >= 1) {
      const prevEntry = history.length >= 2 ? history[history.length - 2] : history[history.length - 1];
      const prevObs = prevEntry.observation || {};
      const prevBattery = prevObs.rover ? prevObs.rover.batteryLevel : battery;
      const actualDrain = Math.round((prevBattery - battery) * 1000) / 1000;
      const expectedDrain = 0.02;

      if (actualDrain >= 2 * expectedDrain) {
        anomalies.push({
          anomalyId: `ANO-BAT-DRAIN-${Date.now()}`,
          type: AnomalyType.BATTERY_DRAIN_ANOMALY,
          severity: AnomalySeverity.HIGH,
          source: 'BATTERY_TELEMETRY',
          detectedAt: Date.now(),
          evidence: {
            expectedConsumption: expectedDrain,
            observedConsumption: actualDrain,
            deviation: actualDrain - expectedDrain
          },
          confidence: 0.90,
          recommendedResponse: 'REPLAN'
        });
      }
    }

    // 3. Rover Health Degradation
    if (health !== 'NOMINAL') {
      anomalies.push({
        anomalyId: `ANO-HLT-${Date.now()}`,
        type: AnomalyType.ROVER_HEALTH_DEGRADATION,
        severity: health === 'CRITICAL' ? AnomalySeverity.CRITICAL : AnomalySeverity.HIGH,
        source: 'DIAGNOSTIC_SUITE',
        detectedAt: Date.now(),
        evidence: { health },
        confidence: 0.95,
        recommendedResponse: health === 'CRITICAL' ? 'REQUEST_EARTH_GUIDANCE' : 'PAUSE_MISSION'
      });
    }

    // 4. Movement Execution Deviation
    if (history.length >= 1) {
      const lastEntry = history[history.length - 1];
      if (lastEntry.decision && lastEntry.decision.action === 'MOVE_ROVER' && lastEntry.executionResult) {
        const expectedDist = 50.0;
        const actualPos = observation.rover.position;
        const prevPos = lastEntry.observation ? lastEntry.observation.rover.position : actualPos;
        const dx = actualPos.x - prevPos.x;
        const dy = actualPos.y - prevPos.y;
        const actualDist = Math.sqrt(dx * dx + dy * dy);

        if (Math.abs(expectedDist - actualDist) > 15) {
          anomalies.push({
            anomalyId: `ANO-MOV-DEV-${Date.now()}`,
            type: AnomalyType.UNEXPECTED_MOVEMENT,
            severity: AnomalySeverity.MEDIUM,
            source: 'KINEMATIC_ENCODER',
            detectedAt: Date.now(),
            evidence: { expectedMovement: expectedDist, observedMovement: actualDist, deviation: expectedDist - actualDist },
            confidence: 0.85,
            recommendedResponse: 'SCAN_TERRAIN'
          });
        }
      }
    }

    // 5. Obstacle Proximity Encounter
    const nearbyObs = observation.environment ? (observation.environment.nearbyObstacles || []) : [];
    const closeObstacle = nearbyObs.find(o => {
      const dx = o.position.x - observation.rover.position.x;
      const dy = o.position.y - observation.rover.position.y;
      return Math.sqrt(dx * dx + dy * dy) <= (o.radius + 5);
    });

    if (closeObstacle) {
      anomalies.push({
        anomalyId: `ANO-OBS-${Date.now()}`,
        type: AnomalyType.OBSTACLE_ENCOUNTER,
        severity: AnomalySeverity.MEDIUM,
        source: 'RADAR_SCANNER',
        detectedAt: Date.now(),
        evidence: { obstacle: closeObstacle },
        confidence: 0.92,
        recommendedResponse: 'WAIT'
      });
    }

    // 6. Hazard Proximity Encounter
    const nearbyHaz = observation.environment ? (observation.environment.nearbyHazards || []) : [];
    const activeHazard = nearbyHaz.find(h => h.active !== false);
    if (activeHazard) {
      const isHigh = activeHazard.riskLevel === 'HIGH' || activeHazard.severity === 'HIGH' || activeHazard.severity === 'CRITICAL';
      anomalies.push({
        anomalyId: `ANO-HAZ-${Date.now()}`,
        type: AnomalyType.HAZARD_ENCOUNTER,
        severity: isHigh ? AnomalySeverity.HIGH : AnomalySeverity.MEDIUM,
        source: 'TERRAIN_SCANNER',
        detectedAt: Date.now(),
        evidence: { hazard: activeHazard },
        confidence: 0.90,
        recommendedResponse: 'SCAN_TERRAIN'
      });
    }

    // 7. Weather Degradation
    if (weatherState === 'DUST_STORM') {
      anomalies.push({
        anomalyId: `ANO-WTH-STORM-${Date.now()}`,
        type: AnomalyType.WEATHER_DEGRADATION,
        severity: AnomalySeverity.HIGH,
        source: 'METEOROLOGY_STATION',
        detectedAt: Date.now(),
        evidence: { weatherState, visibility: 10 },
        confidence: 0.98,
        recommendedResponse: 'WAIT'
      });
    } else if (weatherState === 'DUSTY') {
      anomalies.push({
        anomalyId: `ANO-WTH-DUSTY-${Date.now()}`,
        type: AnomalyType.WEATHER_DEGRADATION,
        severity: AnomalySeverity.MEDIUM,
        source: 'METEOROLOGY_STATION',
        detectedAt: Date.now(),
        evidence: { weatherState, visibility: 50 },
        confidence: 0.85,
        recommendedResponse: 'SCAN_TERRAIN'
      });
    }

    // 8. Communication Blackout
    if (commState === 'BLACKOUT') {
      anomalies.push({
        anomalyId: `ANO-COMM-BLK-${Date.now()}`,
        type: AnomalyType.COMMUNICATION_BLACKOUT,
        severity: AnomalySeverity.LOW,
        source: 'DTN_CHANNEL',
        detectedAt: Date.now(),
        evidence: { communicationState: 'BLACKOUT' },
        confidence: 1.0,
        recommendedResponse: 'CONTINUE_PLAN'
      });
    }

    // 9. Mission Stall Detection
    if (history.length >= 5) {
      const currentTaskId = observation.currentTask ? observation.currentTask.id : 'TASK-1';
      const sameTaskCount = history.filter(h => {
        const hTask = h.observation && h.observation.currentTask ? h.observation.currentTask.id : 'TASK-1';
        return hTask === currentTaskId;
      }).length;

      if (sameTaskCount >= 4) {
        anomalies.push({
          anomalyId: `ANO-STL-${Date.now()}`,
          type: AnomalyType.MISSION_STALL,
          severity: AnomalySeverity.MEDIUM,
          source: 'PROGRESS_MONITOR',
          detectedAt: Date.now(),
          evidence: { stallDurationCycles: sameTaskCount },
          confidence: 0.80,
          recommendedResponse: 'REPLAN'
        });
      }
    }

    // 10. Plan Infeasibility Detection
    if (currentPlan && currentPlan.status === 'FAILED') {
      anomalies.push({
        anomalyId: `ANO-PLN-INF-${Date.now()}`,
        type: AnomalyType.PLAN_INFEASIBILITY,
        severity: AnomalySeverity.HIGH,
        source: 'PLAN_EXECUTIVE',
        detectedAt: Date.now(),
        evidence: { planId: currentPlan.planId, status: currentPlan.status },
        confidence: 0.95,
        recommendedResponse: 'REPLAN'
      });
    }

    // 11. Sensor Inconsistency Detection
    if (health === 'NOMINAL' && battery === 0.0) {
      anomalies.push({
        anomalyId: `ANO-SNS-INC-${Date.now()}`,
        type: AnomalyType.SENSOR_INCONSISTENCY,
        severity: AnomalySeverity.HIGH,
        source: 'CROSS_SENSOR_AUDITOR',
        detectedAt: Date.now(),
        evidence: { health, batteryLevel: battery },
        confidence: 0.88,
        recommendedResponse: 'PAUSE_MISSION'
      });
    }

    return anomalies;
  }
}
