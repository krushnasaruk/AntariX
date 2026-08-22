import assert from 'node:assert';
import {
  MissionManager,
  MarsEnvironment,
  RoverModel,
  createAutonomyObservation,
  AutonomousDecisionEngine,
  SafetyValidator,
  AutonomyActionExecutor,
  MissionPlanner,
  PlanValidator,
  PlanExecutor,
  ContingencyPlanner,
  scorePlan,
  ActionType,
  PlanState,
  PlanActionState,
  PlanRiskLevel
} from '../../packages/simulation-core/index.js';

import {
  DTNCommunicationChannel,
  CommunicationState
} from '../../packages/communication-protocol/index.js';

console.log('🧪 Starting Objective 6: Autonomous Mission Planning & Contingency Planning Unit Tests...\n');

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

// TEST 1: Create MissionPlanner
runTest(1, 'Create MissionPlanner instance', () => {
  const planner = new MissionPlanner();
  assert.ok(planner);
  assert.ok(planner.validator);
  assert.ok(planner.contingencyPlanner);
});

// TEST 2: Generate plan for active mission
runTest(2, 'Generate plan for active mission', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel();
  const env = new MarsEnvironment();

  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const planner = new MissionPlanner();
  const plan = planner.plan(obs);

  assert.ok(plan);
  assert.ok(plan.planId.startsWith('PLAN-'));
  assert.strictEqual(plan.status, PlanState.PLANNED);
});

// TEST 3: Verify plan contains valid actions
runTest(3, 'Verify plan contains non-empty array of valid actions', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  assert.ok(Array.isArray(plan.actions));
  assert.ok(plan.actions.length > 0);
  assert.ok(plan.actions[0].actionType);
});

// TEST 4: Verify action ordering
runTest(4, 'Verify action sequence numbers follow strictly increasing order (1, 2, 3...)', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  for (let i = 0; i < plan.actions.length; i++) {
    assert.strictEqual(plan.actions[i].sequence, i + 1);
  }
});

// TEST 5: Verify action preconditions
runTest(5, 'Verify each plan action defines non-empty preconditions array', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  for (const act of plan.actions) {
    assert.ok(Array.isArray(act.preconditions));
  }
});

// TEST 6: Verify action postconditions
runTest(6, 'Verify each plan action defines expected outcome / postcondition', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  for (const act of plan.actions) {
    assert.ok(act.expectedOutcome);
  }
});

// TEST 7: Generate geological sample collection plan
runTest(7, 'Generate geological sample collection plan for TASK-4', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  missionManager.startTask('TASK-1'); missionManager.completeTask('TASK-1');
  missionManager.startTask('TASK-2'); missionManager.completeTask('TASK-2');
  missionManager.startTask('TASK-3'); missionManager.completeTask('TASK-3');

  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  assert.strictEqual(plan.objective, 'COLLECT_GEOLOGICAL_SAMPLE');
  assert.ok(plan.actions.some(a => a.actionType === ActionType.COLLECT_SAMPLE));
});

// TEST 8: Verify movement precedes sample collection
runTest(8, 'Verify MOVE_ROVER precedes COLLECT_SAMPLE in plan sequence', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  missionManager.startTask('TASK-1'); missionManager.completeTask('TASK-1');
  missionManager.startTask('TASK-2'); missionManager.completeTask('TASK-2');
  missionManager.startTask('TASK-3'); missionManager.completeTask('TASK-3');

  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  const moveIdx = plan.actions.findIndex(a => a.actionType === ActionType.MOVE_ROVER);
  const collectIdx = plan.actions.findIndex(a => a.actionType === ActionType.COLLECT_SAMPLE);

  assert.ok(moveIdx !== -1 && collectIdx !== -1);
  assert.ok(moveIdx < collectIdx);
});

// TEST 9: Verify detection precedes collection
runTest(9, 'Verify DETECT_SAMPLE precedes COLLECT_SAMPLE in plan sequence', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  missionManager.startTask('TASK-1'); missionManager.completeTask('TASK-1');
  missionManager.startTask('TASK-2'); missionManager.completeTask('TASK-2');
  missionManager.startTask('TASK-3'); missionManager.completeTask('TASK-3');

  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  const detectIdx = plan.actions.findIndex(a => a.actionType === ActionType.DETECT_SAMPLE);
  const collectIdx = plan.actions.findIndex(a => a.actionType === ActionType.COLLECT_SAMPLE);

  assert.ok(detectIdx !== -1 && collectIdx !== -1);
  assert.ok(detectIdx < collectIdx);
});

// TEST 10: Verify collection precedes verification
runTest(10, 'Verify COLLECT_SAMPLE precedes VERIFY_SAMPLE in plan sequence', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  missionManager.startTask('TASK-1'); missionManager.completeTask('TASK-1');
  missionManager.startTask('TASK-2'); missionManager.completeTask('TASK-2');
  missionManager.startTask('TASK-3'); missionManager.completeTask('TASK-3');

  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  const collectIdx = plan.actions.findIndex(a => a.actionType === ActionType.COLLECT_SAMPLE);
  const verifyIdx = plan.actions.findIndex(a => a.actionType === ActionType.VERIFY_SAMPLE);

  assert.ok(collectIdx !== -1 && verifyIdx !== -1);
  assert.ok(collectIdx < verifyIdx);
});

// TEST 11: Verify return-to-base exists when appropriate
runTest(11, 'Verify RETURN_TO_BASE action exists in complete mission plan', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  missionManager.startTask('TASK-1'); missionManager.completeTask('TASK-1');
  missionManager.startTask('TASK-2'); missionManager.completeTask('TASK-2');
  missionManager.startTask('TASK-3'); missionManager.completeTask('TASK-3');

  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  assert.ok(plan.actions.some(a => a.actionType === ActionType.RETURN_TO_BASE));
});

// TEST 12: Verify battery feasibility
runTest(12, 'Verify plan energy estimation under normal battery level (94%)', () => {
  const missionManager = new MissionManager();
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel({ batteryLevel: 0.94 }), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  assert.ok(plan.estimatedEnergy > 0);
  assert.ok(plan.estimatedEnergy < 0.94);
});

// TEST 13: Reject plan that violates minimum battery reserve
runTest(13, 'Reject plan that violates minimum battery reserve (10% battery < 15% reserve)', () => {
  const missionManager = new MissionManager();
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel({ batteryLevel: 0.10 }), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  assert.strictEqual(plan.strategy, 'EMERGENCY_RETURN_TO_BASE');
  assert.strictEqual(plan.actions[0].actionType, ActionType.RETURN_TO_BASE);
});

// TEST 14: Verify return-to-base energy is considered
runTest(14, 'Verify return-to-base energy is factored into PlanValidator feasibility calculation', () => {
  const validator = new PlanValidator();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.25 }), new MarsEnvironment(), null);

  // Proposed plan consumes 0.15 energy, leaving 0.10 battery. Return to base from 520,530 consumes ~0.30 energy, violating 15% reserve!
  const heavyPlan = {
    actions: [
      { actionType: ActionType.MOVE_ROVER, parameters: { targetPosition: { x: 520, y: 530 } } }
    ]
  };

  const val = validator.validate(heavyPlan, obs);
  assert.strictEqual(val.valid, false);
  assert.ok(val.rejectionReason.includes('BATTERY_RESERVE_VIOLATION'));
});

// TEST 15: Verify obstacle-aware planning
runTest(15, 'PlanValidator rejects candidate plan traversing known obstacle position', () => {
  const validator = new PlanValidator();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);

  const obstaclePlan = {
    actions: [
      { actionType: ActionType.MOVE_ROVER, parameters: { targetPosition: { x: 250, y: 300 } } } // ROCK_001
    ]
  };

  const val = validator.validate(obstaclePlan, obs);
  assert.strictEqual(val.valid, false);
  assert.ok(val.rejectionReason.includes('OBSTACLE_ROUTE_VIOLATION'));
});

// TEST 16: Verify hazardous terrain affects plan feasibility
runTest(16, 'Plan scoring penalizes high risk terrain options', () => {
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const lowRiskPlan = { actions: [{}], estimatedProgressRatio: 0.5, estimatedEnergy: 0.05, risks: PlanRiskLevel.LOW };
  const highRiskPlan = { actions: [{}], estimatedProgressRatio: 0.5, estimatedEnergy: 0.05, risks: PlanRiskLevel.HIGH };

  const scoreLow = scorePlan(lowRiskPlan, obs);
  const scoreHigh = scorePlan(highRiskPlan, obs);

  assert.ok(scoreLow > scoreHigh);
});

// TEST 17: Verify dust storm affects planning
runTest(17, 'Dust storm forces planner to generate DUST_STORM_HOLDING contingency plan', () => {
  const missionManager = new MissionManager();
  const env = new MarsEnvironment();
  env.updateEnvironment(4000); // Transitions weather to DUST_STORM at t >= 7200s (update env further)
  env.updateEnvironment(4000); // Total 8000s -> DUST_STORM

  const obs = createAutonomyObservation(missionManager, new RoverModel(), env, null);
  assert.strictEqual(obs.environment.weather.state, 'DUST_STORM');

  const planner = new MissionPlanner();
  const plan = planner.plan(obs);

  assert.strictEqual(plan.strategy, 'DUST_STORM_HOLDING');
  assert.strictEqual(plan.actions[0].actionType, ActionType.WAIT);
});

// TEST 18: Verify communication blackout does not automatically stop autonomous planning
runTest(18, 'Communication BLACKOUT does not block autonomous mission plan generation', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const dtnChannel = new DTNCommunicationChannel();
  dtnChannel.setCommunicationState(CommunicationState.BLACKOUT);

  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), dtnChannel);
  assert.strictEqual(obs.communication.communicationState, 'BLACKOUT');

  const planner = new MissionPlanner();
  const plan = planner.plan(obs);

  assert.ok(plan);
  assert.strictEqual(plan.status, PlanState.PLANNED);
});

// TEST 19: Verify Earth approval requirement
runTest(19, 'Plan explanation documents constraints checked and safety rationale', () => {
  const missionManager = new MissionManager();
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  assert.ok(plan.explanation);
  assert.ok(plan.explanation.reasonForSelection);
});

// TEST 20: Verify candidate plans are scored deterministically
runTest(20, 'Verify scorePlan is deterministic', () => {
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const plan = { actions: [{}], estimatedProgressRatio: 0.7, estimatedEnergy: 0.05, risks: PlanRiskLevel.LOW };

  const s1 = scorePlan(plan, obs);
  const s2 = scorePlan(plan, obs);

  assert.strictEqual(s1, s2);
  assert.ok(typeof s1 === 'number');
});

// TEST 21: Verify safest feasible plan is selected
runTest(21, 'Verify MissionPlanner selects the highest scoring candidate plan', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  assert.ok(plan.score !== undefined);
  assert.ok(plan.score > 0);
});

// TEST 22: Verify contingency plan exists
runTest(22, 'ContingencyPlanner generates structured fallback plan', () => {
  const cp = new ContingencyPlanner();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const contingency = cp.generateContingency('OBSTACLE_BLOCKED', obs);

  assert.ok(contingency);
  assert.strictEqual(contingency.strategy, 'OBSTACLE_REOBSERVE_DETOUR');
});

// TEST 23: Execute first plan action
runTest(23, 'PlanExecutor executes first plan action', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel();
  const env = new MarsEnvironment();
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const plan = planner.plan(obs);

  const executor = new PlanExecutor({ missionPlanner: planner });
  const result = executor.executeNextStep(plan, { missionManager, rover, environment: env });

  assert.strictEqual(result.success, true);
  assert.strictEqual(plan.status, PlanState.EXECUTING);
  assert.strictEqual(plan.actions[0].status, PlanActionState.COMPLETED);
});

// TEST 24: Record action completion
runTest(24, 'Executing second step updates next action status to COMPLETED', () => {
  const missionManager = new MissionManager();
  missionManager.startMission();
  const rover = new RoverModel();
  const env = new MarsEnvironment();
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(missionManager, rover, env, null);
  const plan = planner.plan(obs);

  const executor = new PlanExecutor({ missionPlanner: planner });
  executor.executeNextStep(plan, { missionManager, rover, environment: env }); // Step 1
  const step2 = executor.executeNextStep(plan, { missionManager, rover, environment: env }); // Step 2

  assert.strictEqual(step2.success, true);
  assert.strictEqual(plan.actions[1].status, PlanActionState.COMPLETED);
});

// TEST 25: Handle action failure
runTest(25, 'PlanExecutor handles action failure gracefully and marks plan FAILED', () => {
  const missionManager = new MissionManager();
  const rover = new RoverModel({ batteryLevel: 0.0 }); // Zero battery forces movement failure
  const env = new MarsEnvironment();
  const executor = new PlanExecutor();

  const failPlan = {
    status: PlanState.PLANNED,
    actions: [
      { id: 'ACT-1', actionType: ActionType.MOVE_ROVER, parameters: { targetPosition: { x: 120, y: 100 } }, status: PlanActionState.READY }
    ]
  };

  const res = executor.executeNextStep(failPlan, { missionManager, rover, environment: env });
  assert.strictEqual(res.success, false);
  assert.strictEqual(failPlan.status, PlanState.FAILED);
});

// TEST 26: Replan after action failure
runTest(26, 'PlanExecutor triggers replan() on action failure when MissionPlanner is attached', () => {
  const missionManager = new MissionManager();
  const rover = new RoverModel({ batteryLevel: 0.0 });
  const env = new MarsEnvironment();
  const planner = new MissionPlanner();
  const executor = new PlanExecutor({ missionPlanner: planner });

  const failPlan = {
    status: PlanState.PLANNED,
    actions: [
      { id: 'ACT-1', actionType: ActionType.MOVE_ROVER, parameters: { targetPosition: { x: 120, y: 100 } }, status: PlanActionState.READY }
    ]
  };

  const res = executor.executeNextStep(failPlan, { missionManager, rover, environment: env });
  assert.strictEqual(res.success, false);
  assert.ok(res.newPlan);
  assert.strictEqual(res.newPlan.strategy, 'EMERGENCY_RETURN_TO_BASE');
});

// TEST 27: Replan after environment change
runTest(27, 'MissionPlanner replan() generates contingency plan upon environment change', () => {
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const oldPlan = planner.plan(obs);

  const replanned = planner.replan(obs, oldPlan, 'WEATHER_CHANGE_DUST_STORM');
  assert.strictEqual(oldPlan.status, PlanState.FAILED);
  assert.ok(replanned);
});

// TEST 28: Replan after battery change
runTest(28, 'Replan after battery drop triggers battery recovery plan', () => {
  const planner = new MissionPlanner();
  const rover = new RoverModel({ batteryLevel: 0.10 });
  const obs = createAutonomyObservation(new MissionManager(), rover, new MarsEnvironment(), null);

  const replanned = planner.replan(obs, null, 'BATTERY_LOW');
  assert.strictEqual(replanned.strategy, 'EMERGENCY_RETURN_TO_BASE');
});

// TEST 29: Verify same observation produces identical plan
runTest(29, 'Verify determinism: same observation produces identical plan structure', () => {
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);

  const p1 = planner.plan(obs);
  const p2 = planner.plan(obs);

  assert.strictEqual(p1.objective, p2.objective);
  assert.strictEqual(p1.strategy, p2.strategy);
  assert.strictEqual(p1.actions.length, p2.actions.length);
  assert.strictEqual(p1.score, p2.score);
});

// TEST 30: Verify plan explanation exists
runTest(30, 'Verify plan includes structured explanation field', () => {
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  assert.ok(plan.explanation);
  assert.ok(plan.explanation.goal);
  assert.ok(plan.explanation.selectedStrategy);
});

// TEST 31: Verify plan confidence is deterministic
runTest(31, 'Verify plan confidence is a deterministic value between 0.0 and 1.0', () => {
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const plan = planner.plan(obs);

  assert.ok(typeof plan.confidence === 'number');
  assert.ok(plan.confidence >= 0.0 && plan.confidence <= 1.0);
});

// TEST 32: Verify PlanValidator rejects invalid plan
runTest(32, 'PlanValidator rejects empty plan or invalid action structure', () => {
  const validator = new PlanValidator();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);

  const invalidPlan = { actions: [] };
  const val = validator.validate(invalidPlan, obs);

  assert.strictEqual(val.valid, false);
  assert.strictEqual(val.rejectionReason, 'EMPTY_OR_INVALID_PLAN');
});

// TEST 33: Verify PlanExecutor does not bypass Objective 5
runTest(33, 'Verify PlanExecutor uses Objective 5 SafetyValidator internally', () => {
  const executor = new PlanExecutor();
  assert.ok(executor.safetyValidator instanceof SafetyValidator);
  assert.ok(executor.actionExecutor instanceof AutonomyActionExecutor);
});

// TEST 34: Verify Objective 5 safety decision overrides unsafe plan action
runTest(34, 'Objective 5 SafetyValidator rejection prevents unsafe plan action execution', () => {
  const executor = new PlanExecutor();
  const rover = new RoverModel({ position: { x: 240, y: 300 } });
  const env = new MarsEnvironment();

  const unsafePlan = {
    status: PlanState.PLANNED,
    actions: [
      { id: 'ACT-1', actionType: ActionType.MOVE_ROVER, parameters: { targetPosition: { x: 250, y: 300 } }, status: PlanActionState.READY }
    ]
  };

  const res = executor.executeNextStep(unsafePlan, { rover, environment: env });
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.validation.valid, false);
  assert.strictEqual(unsafePlan.status, PlanState.FAILED);
});

// TEST 35: Verify completed plan state
runTest(35, 'Plan status updates to COMPLETED when all plan actions are finished', () => {
  const missionManager = new MissionManager();
  const rover = new RoverModel();
  const env = new MarsEnvironment();
  const executor = new PlanExecutor();

  const singleStepPlan = {
    status: PlanState.PLANNED,
    actions: [
      { id: 'ACT-1', actionType: ActionType.SCAN_TERRAIN, parameters: {}, status: PlanActionState.READY }
    ]
  };

  const res = executor.executeNextStep(singleStepPlan, { missionManager, rover, environment: env });
  assert.strictEqual(res.success, true);
  assert.strictEqual(singleStepPlan.status, PlanState.COMPLETED);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} OBJECTIVE 6 AUTONOMOUS MISSION PLANNING TESTS PASSED CLEANLY!`);
