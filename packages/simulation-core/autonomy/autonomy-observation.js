/**
 * UNIFIED AUTONOMY OBSERVATION FACTORY
 * Combines MissionObservation, RoverObservation, EnvironmentObservation, and CommunicationObservation.
 */

import { calculateOneWayDelay, calculateRoundTripDelay, DistanceScenario } from '../../communication-protocol/index.js';

export function createAutonomyObservation(missionManager = null, rover = null, environment = null, dtnChannel = null) {
  const missionObs = missionManager ? missionManager.generateObservation(dtnChannel) : {};
  const roverObs = rover ? rover.getRoverObservation(environment) : {};
  const envObs = environment ? environment.getEnvironmentObservation(rover) : {};

  const distanceKm = dtnChannel ? dtnChannel.getDistanceKm() : DistanceScenario.TYPICAL_DISTANCE;
  const oneWayDelaySec = calculateOneWayDelay(distanceKm);
  const roundTripDelaySec = calculateRoundTripDelay(distanceKm);

  const commQueued = dtnChannel ? dtnChannel.getQueuedPackets() : [];
  const commInTransit = dtnChannel ? dtnChannel.getInTransitPackets() : [];

  return {
    timestamp: Date.now(),
    mission: missionObs.mission || { status: 'UNKNOWN' },
    currentTask: missionObs.currentTask || null,
    readyTasks: missionObs.readyTasks || [],
    completedTasksCount: missionObs.completedTasksCount || 0,
    totalTasksCount: missionObs.totalTasksCount || 0,
    missionProgress: missionObs.progressPct || 0.0,
    resources: missionObs.resources || { batteryLevel: 1.0 },
    constraints: missionObs.constraints || { minimumBatteryReserve: 0.15 },

    rover: {
      id: roverObs.id || 'UNKNOWN_ROVER',
      position: roverObs.position || { x: 100, y: 100 },
      velocity: roverObs.velocity || { vx: 0, vy: 0, speedMps: 0 },
      heading: roverObs.heading || 0,
      batteryLevel: roverObs.batteryLevel !== undefined ? roverObs.batteryLevel : 0.94,
      batteryCapacity: roverObs.batteryCapacity || 1600,
      temperature: roverObs.temperature || { internalTempCelsius: 15, externalTempCelsius: -60 },
      health: roverObs.health || 'NOMINAL',
      storageUsed: roverObs.storageUsed || 0,
      storageCapacity: roverObs.storageCapacity || 100,
      samplesCollected: roverObs.samplesCollected || []
    },

    environment: {
      simulationTime: envObs.simulationTime || 0,
      terrainAtRover: envObs.terrainAtRover || 'FLAT',
      nearbyObstacles: envObs.nearbyObstacles || [],
      obstacles: (environment && environment.obstacles) ? environment.obstacles.map(o => ({ ...o })) : [
        { id: 'ROCK_001', name: 'Boulder Field', position: { x: 250, y: 300 }, radius: 25 },
        { id: 'ROCK_002', name: 'Steep Cliff', position: { x: 420, y: 380 }, radius: 35 },
        { id: 'ROCK_003', name: 'Steep Rock', position: { x: 300, y: 150 }, radius: 15 }
      ],
      nearbyHazards: envObs.nearbyHazards || [],
      weather: envObs.weather || { state: 'CLEAR', visibility: 100, solarIntensity: 590 },
      missionLocations: envObs.missionLocations || {
        base: { x: 100, y: 100 },
        crater: { x: 500, y: 500 },
        sample: { x: 520, y: 530 }
      }
    },

    communication: {
      communicationState: dtnChannel ? dtnChannel.getCommunicationState() : 'AVAILABLE',
      distanceKm,
      estimatedOneWayDelay: oneWayDelaySec,
      estimatedRoundTripDelay: roundTripDelaySec,
      queuedPackets: commQueued,
      inTransitPackets: commInTransit,
      lastEarthContact: Date.now(),
      pendingCommands: commInTransit.filter(p => p.type === 'COMMAND').length,
      pendingAcknowledgements: commInTransit.filter(p => p.type === 'ACKNOWLEDGEMENT').length
    },

    recentEvents: missionObs.recentEvents || []
  };
}
