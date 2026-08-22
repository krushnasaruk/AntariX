/**
 * DETERMINISTIC & STOCHASTIC MARS ENVIRONMENT MODEL (CRATER-07)
 */

import {
  TerrainType,
  TerrainProperties,
  WeatherState,
  SampleStatus,
  EnvironmentEvent
} from './environment-types.js';
import { SeededPRNG } from './prng.js';

export class MarsEnvironment {
  constructor(config = {}) {
    this.listeners = new Map();
    this.eventHistory = [];
    this.mode = config.mode || 'DETERMINISTIC_TEST_MODE';
    this.seed = config.seed !== undefined ? config.seed : 42;
    this.prng = new SeededPRNG(this.seed);
    this.resetEnvironment(config);
  }

  // ================= EVENT EMITTER =================
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(eventType, payload = {}) {
    const eventObj = {
      eventId: `EVT-ENV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: eventType,
      timestamp: Date.now(),
      simulationTime: this.simulationTime,
      payload
    };

    this.eventHistory.push(eventObj);

    if (this.listeners.has(eventType)) {
      for (const cb of this.listeners.get(eventType)) {
        try {
          cb(eventObj);
        } catch (err) {
          console.error(`Error in environment listener for ${eventType}:`, err);
        }
      }
    }
  }

  // ================= CONFIGURATION =================
  setMode(mode, seed = null) {
    this.mode = mode;
    if (seed !== null && seed !== undefined) {
      this.seed = seed;
      this.prng.reset(seed);
    }
  }

  // ================= INITIALIZATION & RESET =================
  resetEnvironment(config = {}) {
    this.simulationTime = config.startTime || 0;

    this.base = {
      id: 'ALPHA_OUTPOST',
      name: 'Alpha Outpost Base',
      position: { x: 100, y: 100 },
      radius: 30
    };

    this.crater = {
      id: 'CRATER_07',
      name: 'Crater-07',
      position: { x: 500, y: 500 },
      radius: 180
    };

    this.sampleLocation = {
      id: 'SAMPLE_001',
      name: 'Geological Sample Site Alpha',
      position: { x: 520, y: 530 },
      type: 'Basalt Regolith Core',
      mass: 2.5, // kg
      scientificValue: 95,
      status: SampleStatus.UNDISCOVERED
    };

    this.obstacles = [
      {
        id: 'ROCK_001',
        name: 'Boulder Field North',
        position: { x: 250, y: 300 },
        radius: 25,
        type: 'BOULDER_FIELD',
        severity: 'HIGH',
        traversable: false
      },
      {
        id: 'ROCK_002',
        name: 'Crater Rim Cliff',
        position: { x: 420, y: 380 },
        radius: 35,
        type: 'STEEP_CLIFF',
        severity: 'CRITICAL',
        traversable: false
      },
      {
        id: 'ROCK_003',
        name: 'Ridge Boulder',
        position: { x: 300, y: 150 },
        radius: 15,
        type: 'STEEP_ROCK',
        severity: 'MEDIUM',
        traversable: false
      }
    ];

    this.hazards = [
      {
        id: 'HAZARD_001',
        name: 'Sand Dune Region',
        position: { x: 380, y: 480 },
        radius: 50,
        type: 'SAND_DUNE',
        severity: 'MEDIUM',
        active: true,
        description: 'Deep uncompacted sand'
      },
      {
        id: 'HAZARD_002',
        name: 'Fissure Zone',
        position: { x: 200, y: 250 },
        radius: 40,
        type: 'UNSTABLE_GROUND',
        severity: 'HIGH',
        active: true,
        description: 'Fissure prone bedrock'
      }
    ];

    this.weather = {
      state: WeatherState.CLEAR,
      temperature: -60, // °C
      visibility: 100, // %
      dustLevel: 0.05,
      solarIntensity: 590 // W/m^2
    };

    this.eventHistory = [];
  }

  // ================= GEOMETRY & SPATIAL HELPERS =================
  getDistance(posA, posB) {
    const dx = posA.x - posB.x;
    const dy = posA.y - posB.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getTerrainAt(x, y) {
    for (const hazard of this.hazards) {
      if (hazard.active && this.getDistance({ x, y }, hazard.position) <= hazard.radius) {
        if (hazard.type === 'SAND_DUNE') return TerrainType.SAND;
        if (hazard.type === 'UNSTABLE_GROUND') return TerrainType.HAZARDOUS;
      }
    }

    const distToCrater = this.getDistance({ x, y }, this.crater.position);
    if (distToCrater <= this.crater.radius) {
      return TerrainType.CRATER;
    }

    if (x > 200 && x < 350 && y > 150 && y < 350) {
      return TerrainType.ROCKY;
    }

    return TerrainType.FLAT;
  }

  getSlopeAt(x, y) {
    const distToCrater = this.getDistance({ x, y }, this.crater.position);
    if (distToCrater <= this.crater.radius) {
      // Crater rim slope peaks near radius
      const normalizedDist = distToCrater / this.crater.radius;
      if (normalizedDist > 0.8) {
        return 18.0 * ((normalizedDist - 0.8) / 0.2); // Up to 18 deg slope
      }
      return 5.0 * (1.0 - normalizedDist);
    }
    return 0.5; // Nominal terrain slope
  }

  isObstacleAt(position) {
    for (const obstacle of this.obstacles) {
      const dist = this.getDistance(position, obstacle.position);
      if (dist <= obstacle.radius) {
        return obstacle;
      }
    }
    return null;
  }

  getNearbyObstacles(position, radius = 50) {
    return this.obstacles.filter(o => this.getDistance(position, o.position) <= (radius + o.radius));
  }

  getNearbyHazards(position, radius = 50) {
    return this.hazards.filter(h => h.active && this.getDistance(position, h.position) <= (radius + h.radius));
  }

  // ================= SIMULATION TICK & ENVIRONMENT UPDATE =================
  updateEnvironment(simulatedSeconds = 1) {
    if (typeof simulatedSeconds !== 'number' || simulatedSeconds < 0) {
      throw new TypeError('simulatedSeconds must be a non-negative number.');
    }

    this.simulationTime += simulatedSeconds;
    const oldWeather = this.weather.state;

    // Deterministic weather state timeline
    if (this.simulationTime >= 7200 && this.simulationTime < 10800) {
      this.weather.state = WeatherState.DUST_STORM;
      this.weather.visibility = 10;
      this.weather.dustLevel = 0.90;
      this.weather.solarIntensity = 120;
    } else if (this.simulationTime >= 3600 && this.simulationTime < 7200) {
      this.weather.state = WeatherState.DUSTY;
      this.weather.visibility = 50;
      this.weather.dustLevel = 0.40;
      this.weather.solarIntensity = 350;
    } else {
      this.weather.state = WeatherState.CLEAR;
      this.weather.visibility = 100;
      this.weather.dustLevel = 0.05;
      this.weather.solarIntensity = 590;
    }

    if (this.weather.state !== oldWeather) {
      this.emit(EnvironmentEvent.WEATHER_CHANGED, {
        previousWeather: oldWeather,
        currentWeather: this.weather.state,
        weatherDetails: { ...this.weather }
      });
    }
  }

  // ================= OBSERVATIONS =================
  getEnvironmentState() {
    return {
      simulationTime: this.simulationTime,
      mode: this.mode,
      seed: this.seed,
      base: { ...this.base },
      crater: { ...this.crater },
      sampleLocation: { ...this.sampleLocation },
      obstacles: this.obstacles.map(o => ({ ...o })),
      hazards: this.hazards.map(h => ({ ...h })),
      weather: { ...this.weather }
    };
  }

  getEnvironmentObservation(rover = null) {
    const roverPos = rover ? rover.position : this.base.position;

    return {
      simulationTime: this.simulationTime,
      mode: this.mode,
      seed: this.seed,
      weather: { ...this.weather },
      nearbyObstacles: this.getNearbyObstacles(roverPos, 100),
      nearbyHazards: this.getNearbyHazards(roverPos, 100),
      terrainAtRover: this.getTerrainAt(roverPos.x, roverPos.y),
      slopeAtRover: this.getSlopeAt(roverPos.x, roverPos.y),
      missionLocations: {
        base: { ...this.base.position },
        crater: { ...this.crater.position },
        sample: { ...this.sampleLocation.position }
      }
    };
  }
}
