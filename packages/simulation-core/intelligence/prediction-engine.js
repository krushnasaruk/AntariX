/**
 * PREDICTIVE STATE ENGINE
 * Predicts battery depletion, weather transitions, communication latency, and mission progress over time horizons.
 */

import { calculateOneWayDelay, calculateRoundTripDelay } from '../../communication-protocol/index.js';
import { UncertainValue, createPrediction } from '../../shared-types/uncertainty.js';

export class MissionPredictionEngine {
  /**
   * Predicts future simulation state over a specified time horizon in seconds.
   * @param {Object} observation Unified AutonomyObservation
   * @param {number} horizonSeconds Horizon duration in seconds
   * @returns {Object} Structured Predictions
   */
  predict(observation, horizonSeconds = 600) {
    if (!observation || typeof observation !== 'object') {
      return { battery: {}, weather: {}, communication: {}, mission: {} };
    }

    const currentSimTime = observation.environment ? (observation.environment.simulationTime || 0) : 0;
    const futureSimTime = currentSimTime + horizonSeconds;

    // 1. Battery Prediction (Objective 4 energy model)
    const currentBattery = observation.rover ? observation.rover.batteryLevel : 0.94;
    const reserve = observation.constraints ? (observation.constraints.minimumBatteryReserve || 0.15) : 0.15;
    const drainRatePerSec = 0.0001; // deterministic movement/ops rate
    const predictedBattery = Math.max(0.0, currentBattery - (horizonSeconds * drainRatePerSec));
    const reserveViolationExpected = predictedBattery < reserve;
    const batteryStd = Math.round((0.02 + (horizonSeconds / 3600.0) * 0.03) * 1000) / 1000;

    const batteryPrediction = {
      currentBattery,
      predictedBattery: Math.round(predictedBattery * 1000) / 1000,
      horizonSeconds,
      reserveViolationExpected,
      confidence: 0.90,
      uncertainty: new UncertainValue(Math.round(predictedBattery * 1000) / 1000, batteryStd, 0.90, 'fraction').toJSON()
    };

    // 2. Weather Prediction (Reusing Objective 4 deterministic weather timeline)
    let predictedWeatherState = 'CLEAR';
    let predictedVisibility = 100;
    let weatherConfidence = 0.95;

    if (futureSimTime >= 7200 && futureSimTime < 10800) {
      predictedWeatherState = 'DUST_STORM';
      predictedVisibility = 10;
      weatherConfidence = 0.92;
    } else if (futureSimTime >= 3600 && futureSimTime < 7200) {
      predictedWeatherState = 'DUSTY';
      predictedVisibility = 50;
      weatherConfidence = 0.90;
    } else {
      predictedWeatherState = 'CLEAR';
      predictedVisibility = 100;
      weatherConfidence = 0.95;
    }

    const weatherPrediction = {
      currentState: observation.environment && observation.environment.weather ? observation.environment.weather.state : 'CLEAR',
      predictedState: predictedWeatherState,
      predictedVisibility,
      horizonSeconds,
      confidence: weatherConfidence,
      uncertainty: new UncertainValue(predictedVisibility, 5.0, weatherConfidence, 'meters').toJSON()
    };

    // 3. Communication Prediction (Reusing Objective 1 & 2 delay engine)
    const distKm = observation.communication ? (observation.communication.distanceKm || 225000000) : 225000000;
    const oneWayDelay = calculateOneWayDelay(distKm);
    const roundTripDelay = calculateRoundTripDelay(distKm);
    const commState = observation.communication ? observation.communication.communicationState : 'AVAILABLE';

    const communicationPrediction = {
      communicationState: commState,
      distanceKm: distKm,
      estimatedOneWayDelay: oneWayDelay,
      estimatedRoundTripDelay: roundTripDelay,
      blackoutExpected: commState === 'BLACKOUT',
      confidence: 0.98,
      uncertainty: new UncertainValue(oneWayDelay, 0.5, 0.98, 'seconds').toJSON()
    };

    // 4. Mission Progress Prediction
    const currentTask = observation.currentTask ? observation.currentTask.name : 'None';
    const currentProgress = observation.missionProgress || 0.0;
    const predictedProgress = Math.min(100.0, currentProgress + 14.28); // +1 task completion

    const missionPrediction = {
      currentTask,
      currentProgress,
      predictedProgress: Math.round(predictedProgress * 100) / 100,
      resourceMarginFeasible: !reserveViolationExpected,
      confidence: 0.88,
      uncertainty: new UncertainValue(Math.round(predictedProgress * 100) / 100, 2.5, 0.88, 'percent').toJSON()
    };

    return {
      battery: batteryPrediction,
      weather: weatherPrediction,
      communication: communicationPrediction,
      mission: missionPrediction
    };
  }
}
