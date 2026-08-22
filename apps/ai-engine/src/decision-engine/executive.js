import { AnomalyDetectionAgent } from '../agents/anomaly-detection/detector.js';
import { EmergencyFailsafeAgent } from '../agents/emergency/failsafe.js';
import { MissionPlannerAgent } from '../agents/mission-planner/planner.js';

export class ExecutiveDecisionEngine {
  constructor() {
    this.anomalyDetector = new AnomalyDetectionAgent();
    this.failsafe = new EmergencyFailsafeAgent();
    this.planner = new MissionPlannerAgent();
  }

  evaluateCycle(telemetry) {
    const analysis = this.anomalyDetector.analyzeTelemetry(telemetry);
    if (analysis.hasAnomaly) {
      const critical = analysis.anomalies.find(a => a.severity === 'CRITICAL');
      if (critical) {
        return this.failsafe.triggerSafeMode(critical.type);
      }
    }

    return {
      action: 'CONTINUE_NOMINAL_EXECUTION',
      status: 'ALL_SYSTEMS_NOMINAL'
    };
  }
}
