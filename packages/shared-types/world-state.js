/**
 * FORMAL WORLD STATE SCHEMA
 * Unified canonical state shared across Physical Simulation, Digital Twin, AI, Planner, and Telemetry.
 */

import { UncertainValue } from './uncertainty.js';

export class WorldState {
  constructor(data = {}) {
    this.timestamp = data.timestamp || Date.now();
    this.simulationTime = data.simulationTime || 0.0;
    this.mode = data.mode || 'DETERMINISTIC_TEST_MODE'; // 'DETERMINISTIC_TEST_MODE' | 'STOCHASTIC_EXPERIMENT_MODE'
    this.seed = data.seed !== undefined ? data.seed : 42;

    this.missionState = {
      missionId: data.missionState?.missionId || 'MARS_EXPEDITION_01',
      status: data.missionState?.status || 'IN_PROGRESS',
      sol: data.missionState?.sol || 1,
      progressPct: data.missionState?.progressPct || 0.0,
      currentTask: data.missionState?.currentTask || null,
      readyTasks: data.missionState?.readyTasks || [],
      completedTasks: data.missionState?.completedTasks || []
    };

    this.roverState = {
      id: data.roverState?.id || 'ROVER_PERSEVERANCE_2',
      position: data.roverState?.position ? { ...data.roverState.position } : { x: 100, y: 100 },
      velocity: data.roverState?.velocity ? { ...data.roverState.velocity } : { vx: 0, vy: 0, speedMps: 0 },
      heading: data.roverState?.heading !== undefined ? data.roverState.heading : 0,
      battery: data.roverState?.battery !== undefined ? data.roverState.battery : 0.94,
      batteryCapacityWh: data.roverState?.batteryCapacityWh || 1600,
      batteryTemperature: data.roverState?.batteryTemperature !== undefined ? data.roverState.batteryTemperature : 15,
      roverHealth: data.roverState?.roverHealth || 'NOMINAL',
      wheelHealth: data.roverState?.wheelHealth || { fl: 1.0, fr: 1.0, ml: 1.0, mr: 1.0, rl: 1.0, rr: 1.0 },
      roverMassKg: data.roverState?.roverMassKg || 899,
      payloadMassKg: data.roverState?.payloadMassKg || 73,
      storageUsedGb: data.roverState?.storageUsedGb || 0,
      storageCapacityGb: data.roverState?.storageCapacityGb || 100,
      sampleCapacity: data.roverState?.sampleCapacity || 5,
      samplesCollected: data.roverState?.samplesCollected ? [...data.roverState.samplesCollected] : []
    };

    this.environmentState = {
      terrain: data.environmentState?.terrain || 'FLAT',
      slopeDegrees: data.environmentState?.slopeDegrees || 0,
      frictionCoefficient: data.environmentState?.frictionCoefficient || 0.8,
      obstacles: data.environmentState?.obstacles ? [...data.environmentState.obstacles] : [],
      hazards: data.environmentState?.hazards ? [...data.environmentState.hazards] : [],
      weather: data.environmentState?.weather || 'CLEAR',
      temperatureCelsius: data.environmentState?.temperatureCelsius !== undefined ? data.environmentState.temperatureCelsius : -60,
      solarIntensityWm2: data.environmentState?.solarIntensityWm2 !== undefined ? data.environmentState.solarIntensityWm2 : 590,
      visibilityMeters: data.environmentState?.visibilityMeters || 1000,
      dustLevel: data.environmentState?.dustLevel || 0.05
    };

    this.communicationState = {
      linkAvailability: data.communicationState?.linkAvailability !== undefined ? data.communicationState.linkAvailability : true,
      state: data.communicationState?.state || 'AVAILABLE',
      distanceKm: data.communicationState?.distanceKm || 225000000,
      propagationDelaySec: data.communicationState?.propagationDelaySec || 750.5,
      roundTripDelaySec: data.communicationState?.roundTripDelaySec || 1501.0,
      bandwidthKbps: data.communicationState?.bandwidthKbps || 256.0,
      packetLossRate: data.communicationState?.packetLossRate || 0.0,
      jitterSec: data.communicationState?.jitterSec || 0.0,
      queueDepth: data.communicationState?.queueDepth || 0,
      nextContactWindow: data.communicationState?.nextContactWindow || { startTime: 0, endTime: 3600, bandwidth: 256.0, linkQuality: 1.0 },
      contactWindowDurationSec: data.communicationState?.contactWindowDurationSec || 3600
    };

    this.resourceState = {
      energyBudgetWh: data.resourceState?.energyBudgetWh || 1500,
      powerGenerationWatts: data.resourceState?.powerGenerationWatts || 120,
      powerConsumptionWatts: data.resourceState?.powerConsumptionWatts || 85,
      netPowerWatts: (data.resourceState?.powerGenerationWatts || 120) - (data.resourceState?.powerConsumptionWatts || 85)
    };

    // BeliefState: Rover's estimated perception vs ground truth
    this.beliefState = {
      groundTruthPosition: { ...this.roverState.position },
      estimatedPosition: data.beliefState?.estimatedPosition ? { ...data.beliefState.estimatedPosition } : { ...this.roverState.position },
      positionUncertainty: {
        sigmaX: data.beliefState?.positionUncertainty?.sigmaX || 0.0,
        sigmaY: data.beliefState?.positionUncertainty?.sigmaY || 0.0,
        confidence: data.beliefState?.positionUncertainty?.confidence || 1.0
      },
      estimatedBattery: data.beliefState?.estimatedBattery ? { ...data.beliefState.estimatedBattery } : {
        mean: this.roverState.battery,
        standardDeviation: 0.01,
        confidence: 0.95
      },
      estimatedTerrain: data.beliefState?.estimatedTerrain || this.environmentState.terrain,
      knownObstacles: data.beliefState?.knownObstacles ? [...data.beliefState.knownObstacles] : [...this.environmentState.obstacles],
      knownHazards: data.beliefState?.knownHazards ? [...data.beliefState.knownHazards] : [...this.environmentState.hazards]
    };

    this.uncertaintyState = {
      position: new UncertainValue(
        0,
        Math.hypot(this.beliefState.positionUncertainty.sigmaX, this.beliefState.positionUncertainty.sigmaY),
        this.beliefState.positionUncertainty.confidence
      ).toJSON(),
      battery: new UncertainValue(
        this.beliefState.estimatedBattery.mean,
        this.beliefState.estimatedBattery.standardDeviation,
        this.beliefState.estimatedBattery.confidence
      ).toJSON(),
      communicationLatency: new UncertainValue(
        this.communicationState.propagationDelaySec,
        this.communicationState.jitterSec,
        0.98
      ).toJSON(),
      weather: new UncertainValue(
        this.environmentState.solarIntensityWm2,
        this.environmentState.dustLevel * 100,
        0.90
      ).toJSON()
    };
  }

  /**
   * Clones and returns a deep snapshot.
   */
  clone() {
    return new WorldState(JSON.parse(JSON.stringify(this)));
  }

  toJSON() {
    return {
      timestamp: this.timestamp,
      simulationTime: this.simulationTime,
      mode: this.mode,
      seed: this.seed,
      missionState: this.missionState,
      roverState: this.roverState,
      environmentState: this.environmentState,
      communicationState: this.communicationState,
      resourceState: this.resourceState,
      beliefState: this.beliefState,
      uncertaintyState: this.uncertaintyState
    };
  }
}
