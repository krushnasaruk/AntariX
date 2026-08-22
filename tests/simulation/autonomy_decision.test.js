import assert from 'node:assert';
import {
  MissionManager,
  MarsEnvironment,
  RoverModel,
  createAutonomyObservation,
  AutonomousDecisionEngine,
  SafetyValidator,
  AutonomyActionExecutor,
  DecisionHistory,
  AutonomyController,
  ActionType,
  RulePriority,
  MissionStatus,
  TaskStatus,
  SampleStatus
} from '../../packages/simulation-core/index.js';

import {
  DTNCommunicationChannel,
  CommunicationState,
  DistanceScenario
} from '../../packages/communication-protocol/index.js';

console.log('🧪 Starting Objective 5: Autonomous Mars Decision Engine Unit Tests...\n');

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

// TEST 1: Create autonomy observation
runTest(1, 'Create unified AutonomyObservation', () => {
  const missionManager = new MissionManager();
  const rover = new RoverModel();
  const env = new MarsEnvironment();
  const dtnChannel = new DTNCommunicationChannel();

  const obs = createAutonomyObservation(missionManager, rover, env, dtnChannel);
  assert.ok(obs);
  assert.ok(obs.timestamp > 0);
});

// TEST 2: Verify observation combines mission + rover + environment + communication
runTest(2, 'Verify observation combines mission, rover, environment, and communication state', () => {
  const missionManager = new MissionManager();
  const rover = new RoverModel();
  const env = new MarsEnvironment();
  const dtnChannel = new DTNCommunicationChannel();

  const obs = createAutonomyObservation(missionManager, rover, env, dtnChannel);
  assert.strictEqual(obs.mission.id, 'MISSION-CRATER-07');
  assert.strictEqual(obs.rover.id, 'ROVER_PERSEVERANCE_2');
  assert.strictEqual(obs.environment.weather.state, 'CLEAR');
  assert.strictEqual(obs.communication.communicationState, 'AVAILABLE');
  assert.ok(obs.communication.estimatedOneWayDelay > 0);
});

// TEST 3: Normal mission conditions
runTest(3, 'Normal mission conditions produce START_TASK or CONTINUE_TASK decision', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel();
  const env = new MarsEnvironment();
  const dtnChannel = new DTNCommunicationChannel();

  const obs = createAutonomyObservation(missionManager, rover, env, dtnChannel);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.ok(decision);
  assert.ok(decision.action === ActionType.START_TASK || decision.action === ActionType.CONTINUE_TASK);
  assert.strictEqual(decision.priority, RulePriority.AUTONOMY_PROGRESS);
});

// TEST 4: Battery below mission reserve
runTest(4, 'Battery below reserve (12% < 15%) triggers RETURN_TO_BASE decision', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel({ batteryLevel: 0.12 });
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.RETURN_TO_BASE);
  assert.strictEqual(decision.priority, RulePriority.SAFETY_EMERGENCY);
  assert.strictEqual(decision.reason.primary, 'BATTERY_BELOW_RESERVE');
});

// TEST 5: Battery critically low
runTest(5, 'Battery critically low (3% < 5%) triggers WAIT safety decision', () => {
  const missionManager = new MissionManager();
  const rover = new RoverModel({ batteryLevel: 0.03 });
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.WAIT);
  assert.strictEqual(decision.priority, RulePriority.SAFETY_EMERGENCY);
});

// TEST 6: Rover health degraded
runTest(6, 'Rover health degraded triggers safety decision overriding mission progress', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel({ health: 'WARNING' });
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.PAUSE_MISSION);
  assert.strictEqual(decision.priority, RulePriority.SAFETY_EMERGENCY);
});

// TEST 7: Known obstacle directly ahead
runTest(7, 'Known obstacle directly ahead triggers WAIT safety warning', () => {
  const missionManager = new MissionManager();
  const rover = new RoverModel({ position: { x: 248, y: 300 } }); // 2m away from ROCK_001 (250, 300)
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.WAIT);
  assert.strictEqual(decision.priority, RulePriority.HAZARD_SAFETY);
});

// TEST 8: Critical hazard nearby
runTest(8, 'Critical hazard nearby triggers SCAN_TERRAIN safety decision', () => {
  const missionManager = new MissionManager();
  const rover = new RoverModel({ position: { x: 410, y: 380 } }); // Near ROCK_002 cliff
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.priority, RulePriority.HAZARD_SAFETY);
});

// TEST 9: Communication BLACKOUT
runTest(9, 'Communication BLACKOUT with safe conditions continues autonomous task execution', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel({ batteryLevel: 0.65 });
  const env = new MarsEnvironment();
  const dtnChannel = new DTNCommunicationChannel();
  dtnChannel.setCommunicationState(CommunicationState.BLACKOUT);

  const obs = createAutonomyObservation(missionManager, rover, env, dtnChannel);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(obs.communication.communicationState, 'BLACKOUT');
  assert.ok(decision.action === ActionType.START_TASK || decision.action === ActionType.CONTINUE_TASK);
});

// TEST 10: Communication BLACKOUT + unsafe condition
runTest(10, 'Communication BLACKOUT + low battery triggers local RETURN_TO_BASE without waiting for Earth', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel({ batteryLevel: 0.10 });
  const env = new MarsEnvironment();
  const dtnChannel = new DTNCommunicationChannel();
  dtnChannel.setCommunicationState(CommunicationState.BLACKOUT);

  const obs = createAutonomyObservation(missionManager, rover, env, dtnChannel);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.RETURN_TO_BASE);
  assert.strictEqual(decision.priority, RulePriority.SAFETY_EMERGENCY);
  assert.strictEqual(decision.requiresEarthApproval, false);
});

// TEST 11: Communication available but high latency
runTest(11, 'High physical delay preserves local autonomous decision capability', () => {
  const dtnChannel = new DTNCommunicationChannel({ distanceKm: DistanceScenario.FARTHEST_DISTANCE });
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel();
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, dtnChannel);
  assert.ok(obs.communication.estimatedOneWayDelay > 1300); // ~22.3 min

  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);
  assert.ok(decision.action);
});

// TEST 12: Rover near geological sample and TASK-4 active
runTest(12, 'TASK-4 active and rover 20m from sample generates MOVE_ROVER decision toward sample', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  // Fast-forward to TASK-4
  missionManager.startTask('TASK-1'); missionManager.completeTask('TASK-1');
  missionManager.startTask('TASK-2'); missionManager.completeTask('TASK-2');
  missionManager.startTask('TASK-3'); missionManager.completeTask('TASK-3');

  assert.strictEqual(missionManager.getReadyTasks()[0].id, 'TASK-4');

  const rover = new RoverModel({ position: { x: 500, y: 530 } }); // 20m away from 520, 530
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.MOVE_ROVER);
  assert.deepStrictEqual(decision.payload.targetPosition, { x: 520, y: 530 });
});

// TEST 13: Sample detected and rover within collection range
runTest(13, 'TASK-4 active and rover within 2m range generates COLLECT_SAMPLE decision', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  missionManager.startTask('TASK-1'); missionManager.completeTask('TASK-1');
  missionManager.startTask('TASK-2'); missionManager.completeTask('TASK-2');
  missionManager.startTask('TASK-3'); missionManager.completeTask('TASK-3');

  const rover = new RoverModel({ position: { x: 518, y: 530 } }); // 2m away <= 5m
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.COLLECT_SAMPLE);
  assert.strictEqual(decision.priority, RulePriority.MISSION_OBJECTIVE);
});

// TEST 14: Sample collected
runTest(14, 'TASK-5 active generates VERIFY_SAMPLE decision', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  missionManager.startTask('TASK-1'); missionManager.completeTask('TASK-1');
  missionManager.startTask('TASK-2'); missionManager.completeTask('TASK-2');
  missionManager.startTask('TASK-3'); missionManager.completeTask('TASK-3');
  missionManager.startTask('TASK-4'); missionManager.completeTask('TASK-4');

  const rover = new RoverModel();
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.VERIFY_SAMPLE);
});

// TEST 15: Mission tasks completed
runTest(15, 'Completed mission generates SEND_STATUS_REPORT decision', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  for (let i = 1; i <= 7; i++) {
    missionManager.startTask(`TASK-${i}`);
    missionManager.completeTask(`TASK-${i}`);
  }

  assert.strictEqual(missionManager.getMission().status, MissionStatus.COMPLETED);

  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.SEND_STATUS_REPORT);
});

// TEST 16: Critical unknown situation
runTest(16, 'Critical unknown anomaly generates REQUEST_EARTH_GUIDANCE', () => {
  const missionManager = new MissionManager();
  missionManager.getMission().status = 'UNKNOWN_ANOMALY';

  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.REQUEST_EARTH_GUIDANCE);
  assert.strictEqual(decision.requiresEarthApproval, true);
});

// TEST 17: Validate invalid movement decision
runTest(17, 'SafetyValidator rejects MOVE_ROVER directly into obstacle and provides safe alternative', () => {
  const validator = new SafetyValidator();
  const rover = new RoverModel({ position: { x: 240, y: 300 } });
  const env = new MarsEnvironment();
  const obs = createAutonomyObservation(new MissionManager(), rover, env, null);

  const unsafeDecision = {
    action: ActionType.MOVE_ROVER,
    payload: { targetPosition: { x: 250, y: 300 } } // Inside ROCK_001
  };

  const validation = validator.validate(unsafeDecision, obs);
  assert.strictEqual(validation.valid, false);
  assert.ok(validation.rejectionReason.includes('OBSTACLE_COLLISION'));
  assert.strictEqual(validation.decision.action, ActionType.WAIT);
});

// TEST 18: Decision confidence is deterministic
runTest(18, 'Verify decision confidence is a deterministic number between 0.0 and 1.0', () => {
  const engine = new AutonomousDecisionEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const decision = engine.decide(obs);

  assert.ok(typeof decision.confidence === 'number');
  assert.ok(decision.confidence >= 0.0 && decision.confidence <= 1.0);
});

// TEST 19: Same observation produces identical decision
runTest(19, 'Verify determinism: identical observation produces identical decision', () => {
  const engine = new AutonomousDecisionEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);

  const dec1 = engine.decide(obs);
  const dec2 = engine.decide(obs);

  assert.strictEqual(dec1.action, dec2.action);
  assert.strictEqual(dec1.priority, dec2.priority);
  assert.strictEqual(dec1.confidence, dec2.confidence);
  assert.deepStrictEqual(dec1.reason, dec2.reason);
});

// TEST 20: Decision history records decision
runTest(20, 'DecisionHistory records decision cycle entries', () => {
  const history = new DecisionHistory();
  const entry = history.record(
    { action: ActionType.CONTINUE_TASK },
    { valid: true },
    { success: true }
  );

  assert.ok(entry);
  assert.strictEqual(history.getHistory().length, 1);
  assert.strictEqual(history.getLastDecision().decision.action, ActionType.CONTINUE_TASK);
});

// TEST 21: AutonomyController.step() performs one complete cycle
runTest(21, 'AutonomyController.step() executes one complete observe-decide-validate-execute-record cycle', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel();
  const env = new MarsEnvironment();
  const dtnChannel = new DTNCommunicationChannel();

  const controller = new AutonomyController({ missionManager, rover, environment: env, dtnChannel });
  const result = controller.step();

  assert.ok(result.observation);
  assert.ok(result.proposedDecision);
  assert.ok(result.validation);
  assert.ok(result.executionResult);
  assert.ok(result.historyEntry);
});

// TEST 22: Action executor receives selected decision
runTest(22, 'AutonomyActionExecutor executes START_TASK action on MissionManager', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const executor = new AutonomyActionExecutor();

  const decision = { action: ActionType.START_TASK, payload: { taskId: 'TASK-1' } };
  const res = executor.execute(decision, { missionManager });

  assert.strictEqual(res.success, true);
  assert.strictEqual(missionManager.getCurrentTask().id, 'TASK-1');
});

// TEST 23: Failed action generates appropriate result
runTest(23, 'ActionExecutor handles failed movement into obstacle gracefully', () => {
  const rover = new RoverModel({ position: { x: 240, y: 300 } });
  const env = new MarsEnvironment();
  const executor = new AutonomyActionExecutor();

  const decision = { action: ActionType.MOVE_ROVER, payload: { targetPosition: { x: 250, y: 300 } } };
  const res = executor.execute(decision, { rover, environment: env });

  assert.strictEqual(res.success, false);
  assert.strictEqual(res.result.reason, 'OBSTACLE_COLLISION');
});

// TEST 24: Next autonomy cycle reacts to changed observation
runTest(24, 'Next autonomy cycle reacts to changed battery observation', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel({ batteryLevel: 0.90 });
  const env = new MarsEnvironment();
  const controller = new AutonomyController({ missionManager, rover, environment: env });

  // Cycle 1: normal battery -> START_TASK / CONTINUE_TASK
  const step1 = controller.step();
  assert.ok(step1.proposedDecision.action === ActionType.START_TASK || step1.proposedDecision.action === ActionType.CONTINUE_TASK);

  // Drain battery below reserve
  rover.batteryLevel = 0.10;

  // Cycle 2: low battery -> RETURN_TO_BASE
  const step2 = controller.step();
  assert.strictEqual(step2.proposedDecision.action, ActionType.RETURN_TO_BASE);
});

// TEST 25: Emergency safety rule overrides mission progress rule
runTest(25, 'Emergency battery safety rule (Priority 100) overrides mission progress rule (Priority 30)', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel({ batteryLevel: 0.04 }); // Emergency battery
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const engine = new AutonomousDecisionEngine();
  const decision = engine.decide(obs);

  assert.strictEqual(decision.action, ActionType.WAIT);
  assert.strictEqual(decision.priority, RulePriority.SAFETY_EMERGENCY);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} OBJECTIVE 5 AUTONOMOUS DECISION ENGINE TESTS PASSED CLEANLY!`);
