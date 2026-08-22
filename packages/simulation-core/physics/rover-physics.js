export const MARS_GRAVITY = 3.721; // m/s^2

export const TerrainRollingCoefficients = {
  FLAT: 0.04,
  ROUGH: 0.08,
  SOFT_SAND: 0.22,
  REGOLITH_ROCK: 0.12,
  STEEP_SLOPE: 0.15
};

export class RoverPhysicsEngine {
  /**
   * Objective 4 backward-compatible power consumption calculation.
   */
  static calculatePowerConsumption(speedMps, slopeAngleDegrees, wheelSlipRatio) {
    const basePowerWatts = 120.0;
    const mobilityPower = speedMps * 85.0;
    const slopeMultiplier = 1.0 + Math.max(0, Math.sin(slopeAngleDegrees * Math.PI / 180) * 1.5);
    const slipPenalty = 1.0 + (wheelSlipRatio * 2.0);

    return (basePowerWatts + mobilityPower) * slopeMultiplier * slipPenalty;
  }

  /**
   * Objective 4 backward-compatible wheel slip calculation.
   */
  static calculateWheelSlip(terrainType, slopeAngleDegrees = 0) {
    let baseSlip = 0.05;
    if (terrainType === 'SOFT_SAND') baseSlip = 0.25;
    if (terrainType === 'REGOLITH_ROCK') baseSlip = 0.08;

    return Math.min(0.9, baseSlip + (slopeAngleDegrees / 45.0) * 0.4);
  }

  /**
   * Physically interpretable multi-component rover energy model.
   * Models rolling resistance, gravitational slope work, acceleration, drivetrain/motor efficiency,
   * wheel slip, thermal kinetics, and solar charging offset.
   *
   * @param {Object} params
   * @param {number} params.distanceMeters Distance travelled in meters
   * @param {number} [params.speedMps=0.5] Speed in m/s
   * @param {number} [params.slopeAngleDegrees=0] Slope inclination in degrees (+ uphill, - downhill)
   * @param {string} [params.terrainType='FLAT'] Terrain classification
   * @param {number} [params.roverMassKg=899] Rover dry mass
   * @param {number} [params.payloadMassKg=73] Science payload mass
   * @param {number} [params.accelerationMps2=0] Acceleration
   * @param {number} [params.motorEfficiency=0.85] Electric motor efficiency (0.0 to 1.0)
   * @param {number} [params.drivetrainEfficiency=0.90] Gearbox / drivetrain efficiency (0.0 to 1.0)
   * @param {number} [params.wheelSlipRatio=0.05] Wheel slip ratio (0.0 to 1.0)
   * @param {number} [params.externalTempCelsius=-60] Ambient temperature in Celsius
   * @param {number} [params.avionicsBasePowerWatts=80] Standby electronics power in Watts
   * @param {number} [params.solarPowerWatts=0] Solar generation offset in Watts
   * @param {number} [params.batteryCapacityWh=1600] Total battery storage in Wh
   * @returns {Object} Detailed physical breakdown of energy and power
   */
  static calculateDetailedEnergy(params = {}) {
    const distanceMeters = Math.max(0, params.distanceMeters || 0);
    const speedMps = Math.max(0.01, params.speedMps || 0.5);
    const slopeAngleDegrees = params.slopeAngleDegrees || 0;
    const terrainType = params.terrainType || 'FLAT';

    const roverMassKg = params.roverMassKg || 899;
    const payloadMassKg = params.payloadMassKg || 73;
    const totalMassKg = roverMassKg + payloadMassKg;

    const motorEfficiency = Math.max(0.1, Math.min(1.0, params.motorEfficiency || 0.85));
    const drivetrainEfficiency = Math.max(0.1, Math.min(1.0, params.drivetrainEfficiency || 0.90));
    const overallEfficiency = motorEfficiency * drivetrainEfficiency;

    const wheelSlipRatio = params.wheelSlipRatio !== undefined ? params.wheelSlipRatio : this.calculateWheelSlip(terrainType, slopeAngleDegrees);
    const externalTempCelsius = params.externalTempCelsius !== undefined ? params.externalTempCelsius : -60;
    const avionicsBasePowerWatts = params.avionicsBasePowerWatts || 80;
    const solarPowerWatts = params.solarPowerWatts || 0;
    const batteryCapacityWh = params.batteryCapacityWh || 1600;

    const durationSeconds = distanceMeters / speedMps;
    const slopeRad = slopeAngleDegrees * (Math.PI / 180);

    // 1. Normal force and Rolling Resistance (N)
    const normalForceN = totalMassKg * MARS_GRAVITY * Math.cos(slopeRad);
    const crr = TerrainRollingCoefficients[terrainType] || TerrainRollingCoefficients.FLAT;
    const rollingForceN = crr * normalForceN;
    const rollingPowerWatts = rollingForceN * speedMps;

    // 2. Slope Force (N)
    const slopeForceN = totalMassKg * MARS_GRAVITY * Math.sin(slopeRad);
    const slopePowerWatts = Math.max(0, slopeForceN * speedMps); // uphill requires positive mechanical power

    // 3. Acceleration Force (N)
    const accelerationMps2 = params.accelerationMps2 || 0;
    const accelForceN = totalMassKg * accelerationMps2;
    const accelPowerWatts = Math.max(0, accelForceN * speedMps);

    // 4. Total Mechanical Power (Watts)
    const mechanicalPowerWatts = rollingPowerWatts + slopePowerWatts + accelPowerWatts;

    // 5. Electrical Motor Power with Drivetrain Loss
    const electricalDrivePowerWatts = mechanicalPowerWatts / overallEfficiency;

    // 6. Wheel Slip Penalty
    const slipMultiplier = 1.0 + (wheelSlipRatio * 1.5);
    const slipAdjustedDrivePowerWatts = electricalDrivePowerWatts * slipMultiplier;

    // 7. Thermal Kinetic Degradation (Battery internal impedance increases below -20C)
    const coldPenalty = externalTempCelsius < -20 ? 1.0 + Math.abs(externalTempCelsius + 20) * 0.003 : 1.0;
    const grossMobilityPowerWatts = slipAdjustedDrivePowerWatts * coldPenalty;

    // 8. Total System Power (Watts)
    const totalGrossPowerWatts = avionicsBasePowerWatts + grossMobilityPowerWatts;
    const netPowerWatts = Math.max(0, totalGrossPowerWatts - solarPowerWatts);

    // 9. Total Energy Consumed (Joules and Watt-Hours)
    const energyJoules = netPowerWatts * durationSeconds;
    const energyWattHours = energyJoules / 3600.0;
    const batteryFractionConsumed = energyWattHours / batteryCapacityWh;

    return {
      distanceMeters,
      durationSeconds,
      totalMassKg,
      forces: {
        normalForceN: Math.round(normalForceN * 100) / 100,
        rollingForceN: Math.round(rollingForceN * 100) / 100,
        slopeForceN: Math.round(slopeForceN * 100) / 100,
        accelForceN: Math.round(accelForceN * 100) / 100
      },
      power: {
        rollingPowerWatts: Math.round(rollingPowerWatts * 10) / 10,
        slopePowerWatts: Math.round(slopePowerWatts * 10) / 10,
        accelPowerWatts: Math.round(accelPowerWatts * 10) / 10,
        mechanicalPowerWatts: Math.round(mechanicalPowerWatts * 10) / 10,
        avionicsBasePowerWatts,
        solarPowerWatts,
        grossPowerWatts: Math.round(totalGrossPowerWatts * 10) / 10,
        netPowerWatts: Math.round(netPowerWatts * 10) / 10
      },
      energyWattHours: Math.round(energyWattHours * 1000) / 1000,
      batteryFractionConsumed: Math.round(batteryFractionConsumed * 10000) / 10000,
      wheelSlipRatio: Math.round(wheelSlipRatio * 100) / 100,
      crr
    };
  }
}
