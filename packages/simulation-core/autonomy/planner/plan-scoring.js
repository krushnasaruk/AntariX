/**
 * TIME-AWARE & RESOURCE-AWARE DETERMINISTIC PLAN SCORING ENGINE
 * Evaluates candidate plans by balancing safety, battery margin, risk penalty,
 * mission progress, communication contact windows, and uncertainty.
 */

import { PlanRiskLevel } from './planner-types.js';

export function scorePlan(plan, observation) {
  if (!plan || !plan.actions || !Array.isArray(plan.actions)) {
    return 0.0;
  }

  // 1. Mission Progress Score (0 to 40)
  const progressRatio = plan.estimatedProgressRatio || 0.5;
  const progressScore = progressRatio * 40.0;

  // 2. Resource Margin Score (0 to 30)
  const battery = observation.rover ? observation.rover.batteryLevel : 0.94;
  const reserve = observation.constraints ? (observation.constraints.minimumBatteryReserve || 0.15) : 0.15;
  const estimatedConsumption = plan.estimatedEnergy || 0.05;
  const margin = battery - estimatedConsumption - reserve;

  const resourceScore = Math.max(0, Math.min(30, (margin / (1 - reserve)) * 30.0));

  // 3. Risk Penalty (0 to 30)
  let riskPenalty = 0.0;
  const risk = plan.risks || PlanRiskLevel.LOW;

  switch (risk) {
    case PlanRiskLevel.CRITICAL:
      riskPenalty = 30.0;
      break;
    case PlanRiskLevel.HIGH:
      riskPenalty = 20.0;
      break;
    case PlanRiskLevel.MEDIUM:
      riskPenalty = 10.0;
      break;
    case PlanRiskLevel.LOW:
    default:
      riskPenalty = 0.0;
      break;
  }

  // Weather penalty
  if (observation.environment && observation.environment.weather) {
    if (observation.environment.weather.state === 'DUST_STORM') {
      riskPenalty += 15.0;
    } else if (observation.environment.weather.state === 'DUSTY') {
      riskPenalty += 5.0;
    }
  }

  // 4. Communication Window Bonus (+5 for transmission inside active contact window)
  let commBonus = 0.0;
  if (observation.communication && observation.communication.communicationState === 'AVAILABLE') {
    commBonus = 2.0;
  }

  // 5. Uncertainty Penalty (High position or battery uncertainty slightly reduces candidate score)
  let uncertaintyPenalty = 0.0;
  if (observation.rover && observation.rover.positionUncertainty) {
    const sigma = observation.rover.positionUncertainty.sigmaX || 0;
    if (sigma > 2.0) uncertaintyPenalty = 2.0;
  }

  const rawScore = progressScore + resourceScore - riskPenalty + commBonus - uncertaintyPenalty;
  return Math.max(0.0, Math.min(100.0, Math.round(rawScore * 100) / 100));
}
