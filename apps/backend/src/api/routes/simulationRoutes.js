import express from 'express';
import {
  MarsEnvironment,
  RoverModel,
  MissionManager,
  WorldState,
  createCrater07MissionConfig
} from '../../../../../packages/simulation-core/index.js';
import {
  DTNCommunicationChannel,
  CommunicationState,
  calculateOneWayDelay
} from '../../../../../packages/communication-protocol/index.js';

const router = express.Router();

// Authoritative simulation state instance in backend gateway
class SimulationInstance {
  constructor() {
    this.reset();
  }

  reset(seed = 42) {
    this.seed = seed;
    this.env = new MarsEnvironment({ mode: 'DETERMINISTIC_TEST_MODE', seed });
    this.rover = new RoverModel({ mode: 'DETERMINISTIC_TEST_MODE', seed, batteryLevel: 0.942 });
    this.missionManager = new MissionManager(createCrater07MissionConfig());
    this.channel = new DTNCommunicationChannel({ distanceKm: 288000000 });
    this.activeFaults = new Set();
    this.lastStepTime = Date.now();
    this.stepCount = 0;
  }

  step(dt = 1.0) {
    this.stepCount++;
    this.rover.moveRover({ dx: 0.1 * dt, dy: 0.05 * dt }, this.env);
    this.env.updateEnvironment(dt);
    this.channel.update(dt);
    this.lastStepTime = Date.now();
    return this.getWorldState();
  }

  injectFault(faultType) {
    this.activeFaults.add(faultType);

    switch (faultType) {
      case 'DUST_STORM':
      case 'DUST_ACCUMULATION':
        if (this.env.weather) {
          this.env.weather.state = 'DUST_STORM';
          this.env.weather.dustLevel = 1.2;
          this.env.weather.solarIntensity = 120;
        }
        break;
      case 'WHEEL_MOTOR_STALL':
      case 'MOTOR_STALL':
        this.rover.wheelHealth.fl = 0.0;
        break;
      case 'BLACKOUT':
        this.channel.setCommunicationState(CommunicationState.BLACKOUT);
        break;
      case 'BATTERY_CELL_THERMAL_SPIKE':
      case 'BATTERY_DEGRADATION':
        this.rover.batteryTemperature = 65.0;
        this.rover.batteryLevel = Math.max(0.08, this.rover.batteryLevel - 0.25);
        break;
      case 'SAND_ENTRAPMENT':
        this.rover.wheelSlipRatio = 0.45;
        this.env.terrain = 'LOOSE_SAND';
        break;
      case 'SENSOR_DRIFT':
        this.rover.heading = (this.rover.heading + 24.5) % 360;
        break;
      default:
        break;
    }

    return { success: true, injectedFault: faultType, activeFaults: Array.from(this.activeFaults) };
  }

  clearFault(faultType) {
    this.activeFaults.delete(faultType);
    if (faultType === 'BLACKOUT') {
      this.channel.setCommunicationState(CommunicationState.AVAILABLE);
    } else if (faultType === 'DUST_STORM') {
      if (this.env.weather) {
        this.env.weather.state = 'CLEAR';
        this.env.weather.dustLevel = 0.05;
        this.env.weather.solarIntensity = 590;
      }
    }
    return { success: true, activeFaults: Array.from(this.activeFaults) };
  }

  getWorldState() {
    const dist = this.channel.distanceKm || 225000000;
    const oneWaySec = calculateOneWayDelay(dist);
    const mission = this.missionManager.getMission();
    const solarIntensity = this.env.weather?.solarIntensity || 590;

    return {
      timestamp: Date.now(),
      simulationTime: this.stepCount * 1.0,
      activeFaults: Array.from(this.activeFaults),
      mission: {
        missionId: mission.id,
        name: mission.name,
        status: mission.status,
        progressPct: this.missionManager.getMissionProgress(),
        currentTask: this.missionManager.getCurrentTask(),
        readyTasks: this.missionManager.getReadyTasks(),
        completedTasksCount: mission.statistics?.completedTasksCount || 0,
        totalTasksCount: mission.statistics?.totalTasksCount || 5
      },
      rover: {
        id: this.rover.id,
        batteryLevel: Number((this.rover.batteryLevel * 100).toFixed(1)),
        batteryRaw: this.rover.batteryLevel,
        batteryTemperature: this.rover.batteryTemperature || 18.5,
        solarInputWatts: Math.round(solarIntensity * 0.98),
        speedMps: this.rover.velocity?.speedMps || 0.12,
        position: {
          x: Number(this.rover.position.x.toFixed(1)),
          y: Number(this.rover.position.y.toFixed(1)),
          heading: Number(this.rover.heading.toFixed(1))
        },
        wheelSlipRatio: this.rover.wheelSlipRatio || 0.04,
        wheelHealth: this.rover.wheelHealth || { fl: 1.0, fr: 1.0, ml: 1.0, mr: 1.0, rl: 1.0, rr: 1.0 },
        health: this.rover.health || 'NOMINAL',
        samplesCollected: this.rover.samplesCollected || []
      },
      environment: {
        location: 'Jezero Crater — Sector 07',
        terrain: this.env.terrain || 'FLAT_BEDROCK',
        weather: this.env.weather?.state || 'CLEAR',
        gravityMps2: 3.721,
        ambientTempCelsius: this.env.weather?.temperature || -62.4,
        atmosphericDustTau: this.env.weather?.dustLevel || 0.42,
        solarIntensityWm2: solarIntensity,
        surfacePressurePa: 610,
        slopeDegrees: this.env.slopeDegrees || 12.4,
        obstacles: this.env.obstacles || [],
        hazards: this.env.hazards || []
      },
      communication: {
        distanceKm: dist,
        oneWayDelaySec: Math.round(oneWaySec),
        roundTripDelaySec: Math.round(oneWaySec * 2),
        state: this.channel.communicationState || 'AVAILABLE',
        blackout: this.channel.communicationState === CommunicationState.BLACKOUT,
        opticalBandwidthMbps: 100,
        linkMarginDb: 14.2,
        carrierWavelengthNm: 1550,
        dtnQueueSize: this.channel.queue?.getQueueSize ? this.channel.queue.getQueueSize() : 0,
        deliveredPacketsCount: 12,
        droppedPacketsCount: 0
      }
    };
  }
}

export const activeSimulation = new SimulationInstance();

// GET /api/simulation/world-state
router.get('/world-state', (req, res) => {
  res.json({
    success: true,
    source: 'SimulationCore.MarsEnvironment + RoverModel',
    data: activeSimulation.getWorldState()
  });
});

// POST /api/simulation/step
router.post('/step', (req, res) => {
  const dt = req.body?.dt || 1.0;
  const state = activeSimulation.step(dt);
  res.json({ success: true, data: state });
});

// POST /api/simulation/reset
router.post('/reset', (req, res) => {
  const seed = req.body?.seed || 42;
  activeSimulation.reset(seed);
  res.json({ success: true, message: 'Simulation reset to baseline initial state', data: activeSimulation.getWorldState() });
});

// POST /api/simulation/fault/inject
router.post('/fault/inject', (req, res) => {
  const faultType = req.body?.faultType;
  if (!faultType) return res.status(400).json({ success: false, error: 'faultType is required' });
  const result = activeSimulation.injectFault(faultType);
  res.json({ success: true, ...result, data: activeSimulation.getWorldState() });
});

// POST /api/simulation/fault/clear
router.post('/fault/clear', (req, res) => {
  const faultType = req.body?.faultType;
  const result = activeSimulation.clearFault(faultType);
  res.json({ success: true, ...result, data: activeSimulation.getWorldState() });
});

export default router;
