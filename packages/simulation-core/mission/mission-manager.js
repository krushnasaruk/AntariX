/**
 * DETERMINISTIC MARS MISSION MANAGER & TASK EXECUTION ENGINE
 */

import {
  MissionStatus,
  TaskStatus,
  MissionEvent,
  MissionCommandType
} from './mission-types.js';

import { createCrater07MissionConfig } from './crater-07-scenario.js';

const VALID_TRANSITIONS = {
  [MissionStatus.CREATED]: [MissionStatus.PLANNED],
  [MissionStatus.PLANNED]: [MissionStatus.IN_PROGRESS],
  [MissionStatus.IN_PROGRESS]: [
    MissionStatus.PAUSED,
    MissionStatus.WAITING,
    MissionStatus.DEGRADED,
    MissionStatus.ABORTING,
    MissionStatus.COMPLETED,
    MissionStatus.FAILED
  ],
  [MissionStatus.PAUSED]: [MissionStatus.IN_PROGRESS, MissionStatus.ABORTING],
  [MissionStatus.WAITING]: [MissionStatus.IN_PROGRESS, MissionStatus.DEGRADED, MissionStatus.ABORTING, MissionStatus.FAILED],
  [MissionStatus.DEGRADED]: [MissionStatus.IN_PROGRESS, MissionStatus.PAUSED, MissionStatus.ABORTING, MissionStatus.FAILED],
  [MissionStatus.ABORTING]: [MissionStatus.ABORTED, MissionStatus.FAILED],
  [MissionStatus.COMPLETED]: [],
  [MissionStatus.ABORTED]: [],
  [MissionStatus.FAILED]: []
};

export class MissionManager {
  constructor(initialConfig = null) {
    this.listeners = new Map();
    this.eventHistory = [];
    this.createMission(initialConfig || createCrater07MissionConfig());
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
      eventId: `EVT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      missionId: this.mission ? this.mission.id : null,
      type: eventType,
      timestamp: Date.now(),
      taskId: payload.taskId || null,
      payload
    };

    this.eventHistory.push(eventObj);

    if (this.listeners.has(eventType)) {
      for (const cb of this.listeners.get(eventType)) {
        try {
          cb(eventObj);
        } catch (err) {
          console.error(`Error in mission listener for ${eventType}:`, err);
        }
      }
    }
  }

  // ================= MISSION STATE MACHINE =================
  createMission(config) {
    const rawConfig = config || createCrater07MissionConfig();

    this.mission = {
      ...rawConfig,
      status: MissionStatus.CREATED,
      createdAt: Date.now(),
      startedAt: null,
      completedAt: null,
      currentTaskId: null,
      tasks: rawConfig.tasks.map(t => ({ ...t })),
      objectives: rawConfig.objectives.map(o => ({ ...o })),
      constraints: { ...rawConfig.constraints },
      resources: { ...rawConfig.resources },
      statistics: {
        completedTasksCount: 0,
        totalTasksCount: rawConfig.tasks.length,
        progressPct: 0.0
      }
    };

    this.updateReadyTasks();
    this.emit(MissionEvent.MISSION_CREATED, { missionId: this.mission.id });
    return this.mission;
  }

  getMission() {
    return this.mission;
  }

  transitionMissionState(newState) {
    if (!newState || !(newState in MissionStatus)) {
      throw new Error(`Invalid mission state: "${newState}".`);
    }

    const currentStatus = this.mission.status;
    const allowed = VALID_TRANSITIONS[currentStatus] || [];

    if (!allowed.includes(newState)) {
      throw new Error(`Invalid state transition: Cannot transition mission from "${currentStatus}" to "${newState}".`);
    }

    this.mission.status = newState;
    return this.mission.status;
  }

  startMission() {
    if (this.mission.status === MissionStatus.CREATED) {
      this.transitionMissionState(MissionStatus.PLANNED);
      this.emit(MissionEvent.MISSION_PLANNED, { missionId: this.mission.id });
    }

    if (this.mission.status === MissionStatus.PLANNED) {
      this.transitionMissionState(MissionStatus.IN_PROGRESS);
      this.mission.startedAt = Date.now();
      this.updateReadyTasks();
      this.emit(MissionEvent.MISSION_STARTED, { missionId: this.mission.id });
    }
  }

  pauseMission() {
    this.transitionMissionState(MissionStatus.PAUSED);
    this.emit(MissionEvent.MISSION_PAUSED, { missionId: this.mission.id });
  }

  resumeMission() {
    this.transitionMissionState(MissionStatus.IN_PROGRESS);
    this.updateReadyTasks();
    this.emit(MissionEvent.MISSION_RESUMED, { missionId: this.mission.id });
  }

  abortMission(reason = 'Mission aborted by user/command') {
    this.transitionMissionState(MissionStatus.ABORTING);
    this.emit(MissionEvent.MISSION_ABORTING, { reason });

    this.transitionMissionState(MissionStatus.ABORTED);
    this.mission.completedAt = Date.now();
    this.emit(MissionEvent.MISSION_ABORTED, { reason });
  }

  resetMission() {
    return this.createMission(createCrater07MissionConfig());
  }

  // ================= TASK DEPENDENCY & EXECUTION =================
  /**
   * Updates task statuses based on dependency completion state.
   */
  updateReadyTasks() {
    if (!this.mission || !this.mission.tasks) return;

    for (const task of this.mission.tasks) {
      if (task.status === TaskStatus.COMPLETED || task.status === TaskStatus.IN_PROGRESS || task.status === TaskStatus.FAILED || task.status === TaskStatus.CANCELLED) {
        continue;
      }

      const allDepsCompleted = task.dependencies.every(depId => {
        const depTask = this.mission.tasks.find(t => t.id === depId);
        return depTask && depTask.status === TaskStatus.COMPLETED;
      });

      if (allDepsCompleted) {
        task.status = TaskStatus.READY;
      } else {
        task.status = TaskStatus.PENDING;
      }
    }
  }

  /**
   * Returns array of tasks currently ready for execution.
   */
  getReadyTasks() {
    this.updateReadyTasks();
    return this.mission.tasks.filter(t => t.status === TaskStatus.READY);
  }

  /**
   * Returns current actively executing task.
   */
  getCurrentTask() {
    if (!this.mission.currentTaskId) {
      return this.mission.tasks.find(t => t.status === TaskStatus.IN_PROGRESS) || null;
    }
    return this.mission.tasks.find(t => t.id === this.mission.currentTaskId) || null;
  }

  startTask(taskId) {
    if (this.mission.status !== MissionStatus.IN_PROGRESS) {
      throw new Error(`Cannot start task "${taskId}" while mission status is "${this.mission.status}".`);
    }

    const task = this.mission.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task "${taskId}" not found.`);
    }

    this.updateReadyTasks();

    if (task.status !== TaskStatus.READY && task.status !== TaskStatus.PENDING) {
      throw new Error(`Task "${taskId}" cannot be started because its status is "${task.status}".`);
    }

    const uncompletedDeps = task.dependencies.filter(depId => {
      const depTask = this.mission.tasks.find(t => t.id === depId);
      return !depTask || depTask.status !== TaskStatus.COMPLETED;
    });

    if (uncompletedDeps.length > 0) {
      throw new Error(`Task "${taskId}" is blocked by uncompleted dependencies: ${uncompletedDeps.join(', ')}.`);
    }

    task.status = TaskStatus.IN_PROGRESS;
    task.startedAt = Date.now();
    this.mission.currentTaskId = taskId;

    this.emit(MissionEvent.TASK_STARTED, { taskId, taskName: task.name });
    return task;
  }

  completeTask(taskId, result = {}) {
    const task = this.mission.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task "${taskId}" not found.`);
    }

    task.status = TaskStatus.COMPLETED;
    task.completedAt = Date.now();
    task.result = result;

    if (this.mission.currentTaskId === taskId) {
      this.mission.currentTaskId = null;
    }

    this.emit(MissionEvent.TASK_COMPLETED, { taskId, result });

    this.updateReadyTasks();
    this.updateProgressStatistics();

    // Check if all tasks are completed
    const allCompleted = this.mission.tasks.every(t => t.status === TaskStatus.COMPLETED);
    if (allCompleted) {
      this.transitionMissionState(MissionStatus.COMPLETED);
      this.mission.completedAt = Date.now();

      // Mark primary objective completed
      const mainObj = this.mission.objectives.find(o => o.id === 'OBJ-1');
      if (mainObj) mainObj.status = 'COMPLETED';

      this.emit(MissionEvent.MISSION_COMPLETED, { missionId: this.mission.id });
    }

    return task;
  }

  failTask(taskId, failureReason = 'Execution failed') {
    const task = this.mission.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task "${taskId}" not found.`);
    }

    task.status = TaskStatus.FAILED;
    task.failureReason = failureReason;

    if (this.mission.currentTaskId === taskId) {
      this.mission.currentTaskId = null;
    }

    this.emit(MissionEvent.TASK_FAILED, { taskId, failureReason });
    this.updateProgressStatistics();
    return task;
  }

  blockTask(taskId, reason = 'Blocked by environmental/resource constraint') {
    const task = this.mission.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task "${taskId}" not found.`);
    }

    task.status = TaskStatus.BLOCKED;
    this.emit(MissionEvent.TASK_BLOCKED, { taskId, reason });
    return task;
  }

  cancelTask(taskId) {
    const task = this.mission.tasks.find(t => t.id === taskId);
    if (!task) {
      throw new Error(`Task "${taskId}" not found.`);
    }

    task.status = TaskStatus.CANCELLED;
    return task;
  }

  // ================= PROGRESS & METRICS =================
  updateProgressStatistics() {
    const completed = this.mission.tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
    const total = this.mission.tasks.length;
    const pct = total > 0 ? (completed / total) * 100 : 0;

    this.mission.statistics = {
      completedTasksCount: completed,
      totalTasksCount: total,
      progressPct: Math.round(pct * 100) / 100
    };
  }

  getMissionProgress() {
    this.updateProgressStatistics();
    return this.mission.statistics.progressPct;
  }

  // ================= FUTURE AI OBSERVATION INTERFACE =================
  /**
   * Generates structured MissionObservation snapshot for future AI consumption.
   * @param {Object} [dtnChannel] Optional DTN communication channel instance
   * @returns {Object} MissionObservation object
   */
  generateObservation(dtnChannel = null) {
    this.updateProgressStatistics();
    const readyTasks = this.getReadyTasks();

    return {
      mission: {
        id: this.mission.id,
        name: this.mission.name,
        description: this.mission.description,
        status: this.mission.status,
        startedAt: this.mission.startedAt,
        completedAt: this.mission.completedAt,
        currentTaskId: this.mission.currentTaskId
      },
      currentTask: this.getCurrentTask(),
      readyTasks: readyTasks.map(t => ({ id: t.id, name: t.name, priority: t.priority })),
      completedTasksCount: this.mission.statistics.completedTasksCount,
      totalTasksCount: this.mission.statistics.totalTasksCount,
      progressPct: this.mission.statistics.progressPct,
      resources: { ...this.mission.resources },
      constraints: { ...this.mission.constraints },
      communicationState: dtnChannel ? dtnChannel.getCommunicationState() : 'AVAILABLE',
      recentEvents: this.eventHistory.slice(-10)
    };
  }

  // ================= DTN COMMUNICATION INTEGRATION =================
  /**
   * Processes DTN packet commands from Objective 2 communication system.
   * @param {Object} packet DTN Packet
   */
  processDTNCommand(packet) {
    if (!packet || !packet.payload) {
      throw new Error('Invalid DTN command packet.');
    }

    const { commandType, payload } = packet.payload;

    switch (commandType) {
      case MissionCommandType.CREATE_MISSION:
        return this.createMission(payload);
      case MissionCommandType.START_MISSION:
        return this.startMission();
      case MissionCommandType.PAUSE_MISSION:
        return this.pauseMission();
      case MissionCommandType.RESUME_MISSION:
        return this.resumeMission();
      case MissionCommandType.ABORT_MISSION:
        return this.abortMission(payload ? payload.reason : undefined);
      default:
        throw new Error(`Unknown mission command type: "${commandType}".`);
    }
  }
}
