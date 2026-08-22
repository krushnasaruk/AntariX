export class SolarPowerModel {
  static calculateGeneratedWatts(solarFlux, dustFactor, sunElevationDegrees) {
    if (sunElevationDegrees <= 0) return 0; // Night time
    const efficiency = 0.28; // 28% triple-junction solar cell efficiency
    const areaM2 = 2.5; // Solar panel surface area in m^2
    const sunVectorMultiplier = Math.sin(sunElevationDegrees * Math.PI / 180);

    return solarFlux * areaM2 * efficiency * dustFactor * sunVectorMultiplier;
  }
}
