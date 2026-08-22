import assert from 'node:assert';
import {
  MissionManager,
  createCrater07MissionConfig,
  MissionStatus,
  TaskStatus,
  MissionEvent
} from '../../packages/simulation-core/index.js';

import {
  DTNCommunicationChannel,
  CommunicationState
} from '../../packages/communication-protocol/index.js';

console.log('🧪 Starting Objective 3: Mars Mission State & Execution Model Unit Tests...\n');

let passedTests = 0;
let totalTests = 0;

function runTest(num, description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✅ TEST ${num}: ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ TEST ${num}: ${description}`);
    console.error(`     Error: ${error.message}`);
    throw error;
  }
}

const manager = new MissionManager();

// TEST 1: Create Crater-07 mission
runTest(1, 'Create Crater-07 exploration mission', () => {
  const mission = manager.getMission();
  assert.ok(mission);
  assert.strictEqual(mission.id, 'MISSION-CRATER-07');
  assert.strictEqual(mission.name, 'MARS CRATER-07 GEOLOGICAL EXPLORATION');
});

// TEST 2: Verify initial mission state
runTest(2, 'Verify initial mission state is CREATED', () => {
  const mission = manager.getMission();
  assert.strictEqual(mission.status, MissionStatus.CREATED);
  assert.strictEqual(mission.startedAt, null);
  assert.strictEqual(mission.completedAt, null);
});

// TEST 3: Verify all seven tasks exist
runTest(3, 'Verify all seven initial tasks exist in task list', () => {
  const mission = manager.getMission();
  assert.strictEqual(mission.tasks.length, 7);
  const taskNames = mission.tasks.map(t => t.name);
  assert.ok(taskNames.includes('Navigate to Crater-07'));
  assert.ok(taskNames.includes('Perform terrain survey'));
  assert.ok(taskNames.includes('Identify geological sample'));
  assert.ok(taskNames.includes('Collect geological sample'));
  assert.ok(taskNames.includes('Verify sample'));
  assert.ok(taskNames.includes('Return to base'));
  assert.ok(taskNames.includes('Prepare mission report'));
});

// TEST 4: Verify task dependencies
runTest(4, 'Verify sequential task dependency structure', () => {
  const tasks = manager.getMission().tasks;
  assert.deepStrictEqual(tasks[0].dependencies, []);
  assert.deepStrictEqual(tasks[1].dependencies, ['TASK-1']);
  assert.deepStrictEqual(tasks[2].dependencies, ['TASK-2']);
  assert.deepStrictEqual(tasks[3].dependencies, ['TASK-3']);
  assert.deepStrictEqual(tasks[4].dependencies, ['TASK-4']);
  assert.deepStrictEqual(tasks[5].dependencies, ['TASK-5']);
  assert.deepStrictEqual(tasks[6].dependencies, ['TASK-6']);
});

// TEST 5: Verify first task is READY
runTest(5, 'Verify first task (TASK-1) is READY', () => {
  const readyTasks = manager.getReadyTasks();
  assert.strictEqual(readyTasks.length, 1);
  assert.strictEqual(readyTasks[0].id, 'TASK-1');
  assert.strictEqual(readyTasks[0].status, TaskStatus.READY);
});

// TEST 6: Verify dependent tasks remain PENDING/BLOCKED
runTest(6, 'Verify dependent tasks (TASK-2 through TASK-7) remain PENDING', () => {
  const tasks = manager.getMission().tasks;
  for (let i = 1; i < 7; i++) {
    assert.strictEqual(tasks[i].status, TaskStatus.PENDING);
  }
});

// TEST 7: Start mission
runTest(7, 'Start mission and transition to IN_PROGRESS', () => {
  manager.startMission();
  const mission = manager.getMission();
  assert.strictEqual(mission.status, MissionStatus.IN_PROGRESS);
  assert.ok(mission.startedAt > 0);
});

// TEST 8: Start first task
runTest(8, 'Start execution of first task (TASK-1)', () => {
  const task = manager.startTask('TASK-1');
  assert.strictEqual(task.status, TaskStatus.IN_PROGRESS);
  assert.strictEqual(manager.getCurrentTask().id, 'TASK-1');
});

// TEST 9: Complete first task
runTest(9, 'Complete first task (TASK-1)', () => {
  const task = manager.completeTask('TASK-1', { coordinates: { x: 500, y: 500 } });
  assert.strictEqual(task.status, TaskStatus.COMPLETED);
  assert.ok(task.completedAt > 0);
  assert.strictEqual(manager.getCurrentTask(), null);
});

// TEST 10: Verify second task becomes READY
runTest(10, 'Verify second task (TASK-2) automatically becomes READY after TASK-1 completion', () => {
  const readyTasks = manager.getReadyTasks();
  assert.strictEqual(readyTasks.length, 1);
  assert.strictEqual(readyTasks[0].id, 'TASK-2');
  assert.strictEqual(readyTasks[0].status, TaskStatus.READY);
});

// TEST 11: Complete multiple tasks
runTest(11, 'Complete tasks TASK-2 and TASK-3 in sequence', () => {
  manager.startTask('TASK-2');
  manager.completeTask('TASK-2', { surveyCompleted: true });

  const ready = manager.getReadyTasks();
  assert.strictEqual(ready[0].id, 'TASK-3');

  manager.startTask('TASK-3');
  manager.completeTask('TASK-3', { sampleTarget: 'Basalt Core 07' });

  assert.strictEqual(manager.getReadyTasks()[0].id, 'TASK-4');
});

// TEST 12: Verify mission progress calculation
runTest(12, 'Verify mission progress is dynamically derived (3/7 tasks = 42.86%)', () => {
  const progress = manager.getMissionProgress();
  assert.strictEqual(progress, 42.86);
  assert.strictEqual(manager.getMission().statistics.completedTasksCount, 3);
});

// TEST 13: Pause mission
runTest(13, 'Pause in-progress mission', () => {
  manager.pauseMission();
  assert.strictEqual(manager.getMission().status, MissionStatus.PAUSED);
});

// TEST 14: Resume mission
runTest(14, 'Resume paused mission back to IN_PROGRESS', () => {
  manager.resumeMission();
  assert.strictEqual(manager.getMission().status, MissionStatus.IN_PROGRESS);
});

// TEST 15: Fail a task
runTest(15, 'Fail a task and record failure reason', () => {
  manager.startTask('TASK-4');
  const failedTask = manager.failTask('TASK-4', 'Drill motor thermal overload');

  assert.strictEqual(failedTask.status, TaskStatus.FAILED);
  assert.strictEqual(failedTask.failureReason, 'Drill motor thermal overload');
});

// TEST 16: Verify mission reflects failed task
runTest(16, 'Verify mission task list reflects failed task state', () => {
  const task = manager.getMission().tasks.find(t => t.id === 'TASK-4');
  assert.strictEqual(task.status, TaskStatus.FAILED);
  assert.strictEqual(task.failureReason, 'Drill motor thermal overload');
});

// TEST 17: Abort mission
runTest(17, 'Abort mission and transition through ABORTING to ABORTED', () => {
  let abortingFired = false;
  let abortedFired = false;

  manager.on(MissionEvent.MISSION_ABORTING, () => { abortingFired = true; });
  manager.on(MissionEvent.MISSION_ABORTED, () => { abortedFired = true; });

  manager.abortMission('Critical hardware failure');

  assert.strictEqual(manager.getMission().status, MissionStatus.ABORTED);
  assert.strictEqual(abortingFired, true);
  assert.strictEqual(abortedFired, true);
  assert.ok(manager.getMission().completedAt > 0);
});

// TEST 18: Reject invalid state transitions
runTest(18, 'Reject invalid state transitions out of ABORTED without reset', () => {
  assert.throws(() => {
    manager.transitionMissionState(MissionStatus.IN_PROGRESS);
  }, Error);
});

// TEST 19: Generate MissionObservation
runTest(19, 'Generate structured MissionObservation for future AI consumption', () => {
  const dtnChannel = new DTNCommunicationChannel();
  dtnChannel.setCommunicationState(CommunicationState.AVAILABLE);

  const obs = manager.generateObservation(dtnChannel);

  assert.ok(obs);
  assert.strictEqual(obs.mission.id, 'MISSION-CRATER-07');
  assert.strictEqual(obs.mission.status, MissionStatus.ABORTED);
  assert.strictEqual(obs.completedTasksCount, 3);
  assert.strictEqual(obs.totalTasksCount, 7);
  assert.strictEqual(obs.progressPct, 42.86);
  assert.strictEqual(obs.resources.batteryLevel, 0.94);
  assert.strictEqual(obs.constraints.minimumBatteryReserve, 0.15);
  assert.strictEqual(obs.communicationState, CommunicationState.AVAILABLE);
  assert.ok(Array.isArray(obs.recentEvents));
});

// TEST 20: Reset mission
runTest(20, 'Reset mission to pristine initial state', () => {
  manager.resetMission();
  const mission = manager.getMission();

  assert.strictEqual(mission.status, MissionStatus.CREATED);
  assert.strictEqual(mission.startedAt, null);
  assert.strictEqual(mission.completedAt, null);
  assert.strictEqual(manager.getMissionProgress(), 0.0);
  assert.strictEqual(manager.getReadyTasks().length, 1);
  assert.strictEqual(manager.getReadyTasks()[0].id, 'TASK-1');
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} OBJECTIVE 3 MISSION EXECUTION TESTS PASSED CLEANLY!`);
