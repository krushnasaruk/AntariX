/**
 * MARS ENVIRONMENT & ROVER SIMULATION TYPES & CONSTANTS
 */

export const TerrainType = {
  FLAT: 'FLAT',
  ROCKY: 'ROCKY',
  SAND: 'SAND',
  CRATER: 'CRATER',
  STEEP: 'STEEP',
  HAZARDOUS: 'HAZARDOUS'
};

export const TerrainProperties = {
  [TerrainType.FLAT]: {
    movementCost: 1.0,
    energyMultiplier: 1.0,
    riskLevel: 'LOW',
    speedMultiplier: 1.0,
    traversable: true
  },
  [TerrainType.ROCKY]: {
    movementCost: 1.4,
    energyMultiplier: 1.4,
    riskLevel: 'MEDIUM',
    speedMultiplier: 0.7,
    traversable: true
  },
  [TerrainType.SAND]: {
    movementCost: 1.8,
    energyMultiplier: 1.8,
    riskLevel: 'MEDIUM',
    speedMultiplier: 0.5,
    traversable: true
  },
  [TerrainType.CRATER]: {
    movementCost: 1.5,
    energyMultiplier: 1.5,
    riskLevel: 'MEDIUM',
    speedMultiplier: 0.6,
    traversable: true
  },
  [TerrainType.STEEP]: {
    movementCost: 2.5,
    energyMultiplier: 2.5,
    riskLevel: 'HIGH',
    speedMultiplier: 0.3,
    traversable: true
  },
  [TerrainType.HAZARDOUS]: {
    movementCost: 3.0,
    energyMultiplier: 3.0,
    riskLevel: 'CRITICAL',
    speedMultiplier: 0.2,
    traversable: false
  }
};

export const RoverStatus = {
  IDLE: 'IDLE',
  MOVING: 'MOVING',
  SCANNING: 'SCANNING',
  SAMPLING: 'SAMPLING',
  RETURNING: 'RETURNING',
  CHARGING: 'CHARGING',
  DISABLED: 'DISABLED',
  MISSION_COMPLETE: 'MISSION_COMPLETE'
};

export const WeatherState = {
  CLEAR: 'CLEAR',
  DUSTY: 'DUSTY',
  DUST_STORM: 'DUST_STORM'
};

export const SampleStatus = {
  UNDISCOVERED: 'UNDISCOVERED',
  DISCOVERED: 'DISCOVERED',
  COLLECTED: 'COLLECTED',
  VERIFIED: 'VERIFIED'
};

export const EnvironmentEvent = {
  ROVER_MOVED: 'ROVER_MOVED',
  ROVER_STOPPED: 'ROVER_STOPPED',
  OBSTACLE_DETECTED: 'OBSTACLE_DETECTED',
  HAZARD_DETECTED: 'HAZARD_DETECTED',
  TERRAIN_CHANGED: 'TERRAIN_CHANGED',
  BATTERY_UPDATED: 'BATTERY_UPDATED',
  TEMPERATURE_UPDATED: 'TEMPERATURE_UPDATED',
  SAMPLE_LOCATION_REACHED: 'SAMPLE_LOCATION_REACHED',
  BASE_REACHED: 'BASE_REACHED',
  WEATHER_CHANGED: 'WEATHER_CHANGED'
};
