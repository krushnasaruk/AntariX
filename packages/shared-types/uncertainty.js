/**
 * UNCERTAINTY MODEL & UNCERTAIN VALUE PRIMITIVE
 * Represents values with statistical uncertainty, variance, and confidence intervals.
 */

export class UncertainValue {
  /**
   * @param {number} mean Estimated expected value
   * @param {number} standardDeviation Standard deviation of estimate
   * @param {number} confidence Confidence level between 0.0 and 1.0
   * @param {string} [unit=''] Measurement unit
   */
  constructor(mean, standardDeviation = 0.0, confidence = 1.0, unit = '') {
    this.mean = Number(mean) || 0.0;
    this.standardDeviation = Math.max(0.0, Number(standardDeviation) || 0.0);
    this.variance = this.standardDeviation * this.standardDeviation;
    this.confidence = Math.min(1.0, Math.max(0.0, Number(confidence) !== undefined ? Number(confidence) : 1.0));
    this.unit = unit;
  }

  /**
   * Samples a value from normal distribution N(mean, std^2).
   * @param {Function} [randomFn=Math.random]
   * @returns {number}
   */
  sample(randomFn = Math.random) {
    if (this.standardDeviation === 0) return this.mean;
    // Box-Muller transform
    const u1 = Math.max(1e-10, randomFn());
    const u2 = randomFn();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return this.mean + z0 * this.standardDeviation;
  }

  /**
   * Returns lower and upper confidence bounds (e.g. 95% = 1.96 std).
   * @param {number} [zScore=1.96]
   */
  getBounds(zScore = 1.96) {
    return {
      lower: this.mean - zScore * this.standardDeviation,
      upper: this.mean + zScore * this.standardDeviation
    };
  }

  toJSON() {
    return {
      mean: this.mean,
      standardDeviation: this.standardDeviation,
      variance: this.variance,
      confidence: this.confidence,
      unit: this.unit
    };
  }

  static fromJSON(json) {
    if (!json) return new UncertainValue(0, 0, 1.0);
    if (typeof json === 'number') return new UncertainValue(json, 0, 1.0);
    return new UncertainValue(
      json.mean,
      json.standardDeviation || (json.variance ? Math.sqrt(json.variance) : 0),
      json.confidence !== undefined ? json.confidence : 1.0,
      json.unit || ''
    );
  }
}

/**
 * Helper to wrap any prediction with uncertainty metadata.
 */
export function createPrediction(predictedValue, standardDeviation = 0.0, confidence = 1.0, metadata = {}) {
  const uncertain = new UncertainValue(
    typeof predictedValue === 'number' ? predictedValue : (predictedValue?.mean || 0),
    standardDeviation,
    confidence
  );

  return {
    predictedValue: typeof predictedValue === 'number' ? predictedValue : predictedValue,
    uncertainty: uncertain.toJSON(),
    confidence: uncertain.confidence,
    ...metadata
  };
}
