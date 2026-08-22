/**
 * SEEDABLE DETERMINISTIC PSEUDO-RANDOM NUMBER GENERATOR (Mulberry32)
 */

export class SeededPRNG {
  constructor(seed = 42) {
    this.seed = (seed >>> 0) || 42;
    this.initialSeed = this.seed;
  }

  /**
   * Returns a pseudo-random float in [0, 1).
   */
  next() {
    let t = (this.seed += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Returns a normally distributed value N(mean, stdDev^2) via Box-Muller.
   */
  nextGaussian(mean = 0, stdDev = 1) {
    const u1 = Math.max(1e-10, this.next());
    const u2 = this.next();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }

  /**
   * Resets PRNG to initial seed.
   */
  reset(seed = null) {
    if (seed !== null && seed !== undefined) {
      this.initialSeed = (seed >>> 0) || 42;
    }
    this.seed = this.initialSeed;
  }
}
