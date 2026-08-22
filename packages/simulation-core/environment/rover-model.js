/**
 * DETERMINISTIC & STOCHASTIC ROVER MODEL & PHYSICAL KINEMATICS
 */

import {
  RoverStatus,
  SampleStatus,
  TerrainProperties,
  TerrainType
} from './environment-types.js';
import { RoverPhysicsEngine } from '../physics/rover-physics.js';
import { SeededPRNG } from './prng.js';

export class RoverModel {
  constructor(config = {}) {
    this.id = config.id || 'ROVER_PERSEVERANCE_2';
    this.mode = config.mode || 'DETERMINISTIC_TEST_MODE';
    this.seed = config.seed !== undefined ? config.seed : 42;
    this.prng = new SeededPRNG(this.seed);

    this.position = config.position ? { ...config.position } : { x: 100, y: 100 };
    this.velocity = { vx: 0, vy: 0, speedMps: 0 };
    this.heading = config.heading || 0; // degrees

    this.roverMassKg = config.roverMassKg || 899;
    this.payloadMassKg = config.payloadMassKg || 73;
    this.batteryCapacity = config.batteryCapacity || 1600; // Wh
    this.batteryLevel = config.batteryLevel !== undefined ? config.batteryLevel : 0.94; // fraction 0.0 to 1.0
    this.energyConsumptionRate = config.energyConsumptionRate || 0.0005; // fraction per meter

    this.temperature = {
      internalTempCelsius: 15,
      externalTempCelsius: -60
    };

    this.health = config.health || 'NOMINAL';
    this.wheelHealth = config.wheelHealth || { fl: 1.0, fr: 1.0, ml: 1.0, mr: 1.0, rl: 1.0, rr: 1.0 };
    this.storageUsed = config.storageUsed || 0; // GB
    this.storageCapacity = config.storageCapacity || 100; // GB
    this.sampleCapacity = config.sampleCapacity || 5; // count
    this.samplesCollected = [];

    this.status = RoverStatus.IDLE;
    this.localizationNoiseSigma = config.localizationNoiseSigma !== undefined
      ? config.localizationNoiseSigma
      : (this.mode === 'STOCHASTIC_EXPERIMENT_MODE' ? 1.5 : 0.0);

    this.lastEnergyBreakdown = null;
  }

  /**
   * Sets simulation mode and seed.
   */
  setMode(mode, seed = null) {
    this.mode = mode;
    if (seed !== null && seed !== undefined) {
      this.seed = seed;
      this.prng.reset(seed);
    }
    this.localizationNoiseSigma = (mode === 'STOCHASTIC_EXPERIMENT_MODE' ? 1.5 : 0.0);
  }

  /**
   * Moves the rover toward a target coordinate or by a relative delta (dx, dy).
   * Verifies obstacle collisions, terrain traversability, and battery level.
   * @param {Object} command { dx, dy } or { targetPosition: {x, y} }
   * @param {Object} environment MarsEnvironment instance
   * @returns {Object} Movement result object
   */
  moveRover(command = {}, environment) {
    if (!environment) {
      throw new Error('MarsEnvironment instance required to execute rover movement.');
    }

    let targetX = this.position.x;
    let targetY = this.position.y;

    if (command.targetPosition) {
      targetX = command.targetPosition.x;
      targetY = command.targetPosition.y;
    } else if (command.dx !== undefined || command.dy !== undefined) {
      targetX += (command.dx || 0);
      targetY += (command.dy || 0);
    } else if (command.distance !== undefined && command.directionDegrees !== undefined) {
      const rad = command.directionDegrees * (Math.PI / 180);
      targetX += Math.cos(rad) * command.distance;
      targetY += Math.sin(rad) * command.distance;
    }

    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    const distanceTravelled = Math.sqrt(dx * dx + dy * dy);

    if (distanceTravelled === 0) {
      return {
        success: true,
        previousPosition: { ...this.position },
        newPosition: { ...this.position },
        distanceTravelled: 0,
        energyConsumed: 0
      };
    }

    // 1. Check obstacle collision
    const obstacleCollision = environment.isObstacleAt({ x: targetX, y: targetY });
    if (obstacleCollision) {
      this.status = RoverStatus.IDLE;
      return {
        success: false,
        reason: 'OBSTACLE_COLLISION',
        obstacle: obstacleCollision
      };
    }

    // 2. Check terrain traversability
    const terrainType = environment.getTerrainAt(targetX, targetY);
    const terrainProps = TerrainProperties[terrainType] || TerrainProperties[TerrainType.FLAT];

    if (!terrainProps.traversable) {
      this.status = RoverStatus.IDLE;
      return {
        success: false,
        reason: 'HAZARDOUS_TERRAIN',
        terrainType
      };
    }

    // 3. Physical energy calculation
    const slopeAngleDegrees = environment.getSlopeAt ? environment.getSlopeAt(targetX, targetY) : 0;
    const detailedEnergy = RoverPhysicsEngine.calculateDetailedEnergy({
      distanceMeters: distanceTravelled,
      speedMps: 0.5,
      slopeAngleDegrees,
      terrainType,
      roverMassKg: this.roverMassKg,
      payloadMassKg: this.payloadMassKg,
      externalTempCelsius: this.temperature.externalTempCelsius,
      batteryCapacityWh: this.batteryCapacity
    });
    this.lastEnergyBreakdown = detailedEnergy;

    // Check battery consumption (exact backward compatible formula)
    const energyConsumed = distanceTravelled * terrainProps.energyMultiplier * this.energyConsumptionRate;

    if (this.batteryLevel < energyConsumed) {
      this.status = RoverStatus.IDLE;
      return {
        success: false,
        reason: 'INSUFFICIENT_BATTERY',
        batteryLevel: this.batteryLevel,
        energyRequired: energyConsumed
      };
    }

    // Execute movement
    const previousPosition = { ...this.position };
    this.position = { x: targetX, y: targetY };
    this.batteryLevel = Math.max(0, this.batteryLevel - energyConsumed);
    this.heading = Math.atan2(dy, dx) * (180 / Math.PI);
    this.status = RoverStatus.MOVING;

    return {
      success: true,
      previousPosition,
      newPosition: { ...this.position },
      distanceTravelled,
      energyConsumed,
      energyBreakdown: detailedEnergy,
      terrainType
    };
  }

  stopRover() {
    this.status = RoverStatus.IDLE;
  }

  /**
   * Detects geological sample if rover is within scan range (50m).
   */
  detectSample(environment) {
    if (!environment || !environment.sampleLocation) {
      return { detected: false, reason: 'NO_SAMPLE_LOCATION' };
    }

    const dist = environment.getDistance(this.position, environment.sampleLocation.position);
    if (dist <= 50) {
      if (environment.sampleLocation.status === SampleStatus.UNDISCOVERED) {
        environment.sampleLocation.status = SampleStatus.DISCOVERED;
      }
      return {
        detected: true,
        sample: { ...environment.sampleLocation },
        distance: dist
      };
    }

    return { detected: false, distance: dist };
  }

  /**
   * Attempts to collect geological sample if within range (<= 5m) and capacity available.
   */
  collectSample(environment) {
    if (!environment || !environment.sampleLocation) {
      return { success: false, reason: 'NO_SAMPLE_LOCATION' };
    }

    const dist = environment.getDistance(this.position, environment.sampleLocation.position);
    if (dist > 5) {
      return { success: false, reason: 'SAMPLE_OUT_OF_RANGE', distance: dist };
    }

    const sample = environment.sampleLocation;
    if (sample.status === SampleStatus.COLLECTED || sample.status === SampleStatus.VERIFIED) {
      return { success: false, reason: 'SAMPLE_ALREADY_COLLECTED' };
    }

    if (this.samplesCollected.length >= this.sampleCapacity || this.storageUsed >= this.storageCapacity) {
      return { success: false, reason: 'STORAGE_FULL' };
    }

    sample.status = SampleStatus.COLLECTED;
    this.samplesCollected.push({ ...sample });
    this.storageUsed += 10;
    this.status = RoverStatus.SAMPLING;

    return {
      success: true,
      sample: { ...sample }
    };
  }

  /**
   * Verifies collected sample.
   */
  verifySample(environment) {
    const sampleInBag = this.samplesCollected[0] || (environment ? environment.sampleLocation : null);
    if (!sampleInBag || (sampleInBag.status !== SampleStatus.COLLECTED && sampleInBag.status !== SampleStatus.VERIFIED)) {
      return { success: false, reason: 'SAMPLE_NOT_COLLECTED' };
    }

    sampleInBag.status = SampleStatus.VERIFIED;
    if (environment && environment.sampleLocation.id === sampleInBag.id) {
      environment.sampleLocation.status = SampleStatus.VERIFIED;
    }

    return { success: true, sample: { ...sampleInBag } };
  }

  updateRover(simulatedSeconds = 1) {
    if (this.status === RoverStatus.MOVING) {
      // Idle after tick unless actively driven
      this.status = RoverStatus.IDLE;
    }
  }

  /**
   * Produces structured RoverObservation snapshot with Ground Truth vs Belief State.
   */
  getRoverObservation(environment = null) {
    const terrain = environment ? environment.getTerrainAt(this.position.x, this.position.y) : TerrainType.FLAT;
    const nearbyObs = environment ? environment.getNearbyObstacles(this.position, 50) : [];
    const nearbyHazards = environment ? environment.getNearbyHazards(this.position, 50) : [];

    // Calculate localization estimate with noise if in stochastic mode
    let estX = this.position.x;
    let estY = this.position.y;
    if (this.mode === 'STOCHASTIC_EXPERIMENT_MODE' && this.localizationNoiseSigma > 0) {
      estX += this.prng.nextGaussian(0, this.localizationNoiseSigma);
      estY += this.prng.nextGaussian(0, this.localizationNoiseSigma);
    }

    return {
      timestamp: Date.now(),
      id: this.id,
      mode: this.mode,
      seed: this.seed,
      position: { ...this.position },
      groundTruthPosition: { ...this.position },
      estimatedPosition: { x: Math.round(estX * 100) / 100, y: Math.round(estY * 100) / 100 },
      positionUncertainty: {
        sigmaX: this.localizationNoiseSigma,
        sigmaY: this.localizationNoiseSigma,
        confidence: this.mode === 'STOCHASTIC_EXPERIMENT_MODE' ? 0.90 : 1.0
      },
      velocity: { ...this.velocity },
      heading: this.heading,
      batteryLevel: this.batteryLevel,
      estimatedBattery: {
        mean: this.batteryLevel,
        standardDeviation: this.mode === 'STOCHASTIC_EXPERIMENT_MODE' ? 0.015 : 0.0,
        confidence: 0.95
      },
      batteryCapacity: this.batteryCapacity,
      temperature: { ...this.temperature },
      health: this.health,
      wheelHealth: { ...this.wheelHealth },
      roverMassKg: this.roverMassKg,
      payloadMassKg: this.payloadMassKg,
      terrain,
      nearbyObstacles: nearbyObs,
      nearbyHazards: nearbyHazards,
      storageUsed: this.storageUsed,
      storageCapacity: this.storageCapacity,
      samplesCollected: this.samplesCollected.map(s => ({ ...s })),
      lastEnergyBreakdown: this.lastEnergyBreakdown
    };
  }
}
