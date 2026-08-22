/**
 * INTELLIGENCE MODEL BASE ABSTRACTION
 * Interface allowing future ML or LLM intelligence models to plug in seamlessly.
 */

export class IntelligenceModel {
  analyze(observation, history = []) {
    throw new Error('IntelligenceModel.analyze() must be implemented by subclass.');
  }

  predict(observation, horizonSeconds = 600) {
    throw new Error('IntelligenceModel.predict() must be implemented by subclass.');
  }

  scoreRisk(observation, anomalies = []) {
    throw new Error('IntelligenceModel.scoreRisk() must be implemented by subclass.');
  }
}
