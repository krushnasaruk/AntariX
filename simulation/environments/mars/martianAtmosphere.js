export class MartianAtmosphereModel {
  static getAtmosphericPressure() {
    return 610; // Pascals (~0.6% of Earth pressure)
  }

  static getAmbientTemperature(solTimeFraction) {
    // Night min -90°C, day max -20°C
    const tempRange = 70;
    return -90 + Math.sin(solTimeFraction * Math.PI * 2) * (tempRange / 2) + 35;
  }
}
