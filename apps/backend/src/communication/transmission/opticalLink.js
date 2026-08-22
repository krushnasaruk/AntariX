export class DeepSpaceOpticalLink {
  constructor() {
    this.signalMarginDb = 14.2;
    this.frequencyGHz = 1550; // Optical laser wavelength band
    this.laserStatus = 'ACTIVE_LOCKED';
    this.bitrateMbps = 100;
  }

  getLinkMetrics() {
    return {
      status: this.laserStatus,
      marginDb: this.signalMarginDb + (Math.random() * 0.4 - 0.2),
      bandwidthMbps: this.bitrateMbps,
      dopplerShiftHz: 14205.8
    };
  }
}

export const opticalLink = new DeepSpaceOpticalLink();
