/**
 * MARS CRATER-07 GEOLOGICAL EXPLORATION SCENARIO DEFINITION
 */

import { MissionStatus, TaskStatus, TaskPriority } from './mission-types.js';

export function createCrater07MissionConfig() {
  return {
    id: 'MISSION-CRATER-07',
    name: 'MARS CRATER-07 GEOLOGICAL EXPLORATION',
    description: 'Explore Crater-07 and collect a geological sample.',
    status: MissionStatus.CREATED,
    priority: 'HIGH',
    createdAt: Date.now(),
    startedAt: null,
    completedAt: null,
    currentTaskId: null,

    objectives: [
      {
        id: 'OBJ-1',
        name: 'COLLECT_GEOLOGICAL_SAMPLE',
        description: 'Explore Crater-07 and collect a geological sample.',
        successCondition: 'A valid geological sample has been collected and verified.',
        status: 'PENDING'
      }
    ],

    tasks: [
      {
        id: 'TASK-1',
        name: 'Navigate to Crater-07',
        description: 'Drive the rover from base outpost to the rim of Crater-07.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        dependencies: [],
        createdAt: Date.now(),
        startedAt: null,
        completedAt: null,
        failureReason: null,
        result: null
      },
      {
        id: 'TASK-2',
        name: 'Perform terrain survey',
        description: 'Scan elevation, slope angle, and obstacles inside Crater-07 sector.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.NORMAL,
        dependencies: ['TASK-1'],
        createdAt: Date.now(),
        startedAt: null,
        completedAt: null,
        failureReason: null,
        result: null
      },
      {
        id: 'TASK-3',
        name: 'Identify geological sample',
        description: 'Locate high-priority basalt regolith outcrop at target location.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.NORMAL,
        dependencies: ['TASK-2'],
        createdAt: Date.now(),
        startedAt: null,
        completedAt: null,
        failureReason: null,
        result: null
      },
      {
        id: 'TASK-4',
        name: 'Collect geological sample',
        description: 'Deploy robotic arm drill and secure sample in sealed container.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.CRITICAL,
        dependencies: ['TASK-3'],
        createdAt: Date.now(),
        startedAt: null,
        completedAt: null,
        failureReason: null,
        result: null
      },
      {
        id: 'TASK-5',
        name: 'Verify sample',
        description: 'Perform spectrometer verification of collected core sample.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        dependencies: ['TASK-4'],
        createdAt: Date.now(),
        startedAt: null,
        completedAt: null,
        failureReason: null,
        result: null
      },
      {
        id: 'TASK-6',
        name: 'Return to base',
        description: 'Navigate back to Alpha Outpost base with secured sample.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.HIGH,
        dependencies: ['TASK-5'],
        createdAt: Date.now(),
        startedAt: null,
        completedAt: null,
        failureReason: null,
        result: null
      },
      {
        id: 'TASK-7',
        name: 'Prepare mission report',
        description: 'Aggregate telemetry, science data, and telemetry summary for Earth uplink.',
        status: TaskStatus.PENDING,
        priority: TaskPriority.NORMAL,
        dependencies: ['TASK-6'],
        createdAt: Date.now(),
        startedAt: null,
        completedAt: null,
        failureReason: null,
        result: null
      }
    ],

    constraints: {
      minimumBatteryReserve: 0.15, // 15%
      maxMissionDurationSeconds: 86400, // 24 hours
      maxAcceptableRisk: 'MEDIUM',
      communicationRequired: true,
      roverSpeedLimitMps: 0.5,
      maxSlopeDegrees: 25
    },

    resources: {
      batteryLevel: 0.94, // 94%
      storageCapacity: 100, // GB
      sampleCapacity: 5, // container slots
      communicationAvailability: 'AVAILABLE',
      scientificEquipment: 'NOMINAL',
      roverHealth: 'NOMINAL'
    },

    statistics: {
      completedTasksCount: 0,
      totalTasksCount: 7,
      progressPct: 0.0
    },

    metadata: {
      scenarioName: 'MARS CRATER-07 EXPLORATION',
      targetLocation: 'Jezero Crater Sector 07',
      createdSol: 142
    }
  };
}
