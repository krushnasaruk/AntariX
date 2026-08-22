/**
 * DECISION PROVENANCE & AUDIT TRAIL
 * Logs decision records tracking model metadata, confidence, safety decisions, and outcomes.
 */

export class DecisionProvenanceLogger {
  constructor() {
    this.records = [];
  }

  logDecision(record = {}) {
    const decisionRecord = {
      decisionId: record.decisionId || `DEC-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: record.timestamp || Date.now(),
      missionId: record.missionId || 'MARS_EXPEDITION_01',
      observationId: record.observationId || `OBS-${Date.now()}`,
      modelName: record.modelName || 'deterministic-decision-engine',
      modelVersion: record.modelVersion || '1.0.0',
      modelHash: record.modelHash || 'sha256-nominal',
      inputSchemaVersion: 'v1.2.0',
      prediction: record.prediction || {},
      confidence: record.confidence !== undefined ? record.confidence : 1.0,
      recommendation: record.recommendation || 'CONTINUE',
      plannerDecision: record.plannerDecision || null,
      safetyDecision: record.safetyDecision || 'APPROVED',
      executedAction: record.executedAction || {},
      actualOutcome: record.actualOutcome || null,
      isOOD: Boolean(record.isOOD)
    };

    this.records.push(decisionRecord);
    return decisionRecord;
  }

  getRecords() {
    return [...this.records];
  }
}
