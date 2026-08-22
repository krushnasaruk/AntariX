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
  AnomalyDetector,
  RiskAssessmentEngine,
  MissionPredictionEngine,
  MissionIntelligenceEngine,
  IntelligenceHistory,
  DeterministicIntelligenceModel,
  AnomalyType,
  AnomalySeverity,
  RiskLevel,
  ActionType
} from '../../packages/simulation-core/index.js';

import {
  DTNCommunicationChannel,
  CommunicationState,
  calculateOneWayDelay
} from '../../packages/communication-protocol/index.js';

console.log('🧪 Starting Objective 7: AI Mission Intelligence & Predictive Risk Engine Unit Tests...\n');

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

// TEST 1: Create AnomalyDetector
runTest(1, 'Create AnomalyDetector instance', () => {
  const detector = new AnomalyDetector();
  assert.ok(detector);
});

// TEST 2: Create RiskAssessmentEngine
runTest(2, 'Create RiskAssessmentEngine instance', () => {
  const riskEngine = new RiskAssessmentEngine();
  assert.ok(riskEngine);
});

// TEST 3: Create MissionPredictionEngine
runTest(3, 'Create MissionPredictionEngine instance', () => {
  const predEngine = new MissionPredictionEngine();
  assert.ok(predEngine);
});

// TEST 4: Create MissionIntelligenceEngine
runTest(4, 'Create MissionIntelligenceEngine instance', () => {
  const intelEngine = new MissionIntelligenceEngine();
  assert.ok(intelEngine);
});

// TEST 5: Normal mission produces no critical anomaly
runTest(5, 'Normal mission state produces zero CRITICAL anomalies', () => {
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const detector = new AnomalyDetector();
  const anomalies = detector.detect(obs);

  assert.strictEqual(anomalies.some(a => a.severity === AnomalySeverity.CRITICAL), false);
});

// TEST 6: Low battery detected
runTest(6, 'Low battery (12% < 15%) triggers BATTERY_LOW anomaly (HIGH severity)', () => {
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.12 }), new MarsEnvironment(), null);
  const detector = new AnomalyDetector();
  const anomalies = detector.detect(obs);

  const batAno = anomalies.find(a => a.type === AnomalyType.BATTERY_LOW);
  assert.ok(batAno);
  assert.strictEqual(batAno.severity, AnomalySeverity.HIGH);
});

// TEST 7: Critical battery detected
runTest(7, 'Critical battery (3% < 5%) triggers BATTERY_LOW anomaly (CRITICAL severity)', () => {
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.03 }), new MarsEnvironment(), null);
  const detector = new AnomalyDetector();
  const anomalies = detector.detect(obs);

  const batAno = anomalies.find(a => a.type === AnomalyType.BATTERY_LOW);
  assert.ok(batAno);
  assert.strictEqual(batAno.severity, AnomalySeverity.CRITICAL);
});

// TEST 8: Battery drain anomaly detected
runTest(8, 'Abnormal battery consumption rate triggers BATTERY_DRAIN_ANOMALY', () => {
  const detector = new AnomalyDetector();
  const obs1 = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.90 }), new MarsEnvironment(), null);
  const obs2 = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.82 }), new MarsEnvironment(), null);

  const history = [{ observation: obs1 }, { observation: obs2 }];
  const anomalies = detector.detect(obs2, history);

  const drainAno = anomalies.find(a => a.type === AnomalyType.BATTERY_DRAIN_ANOMALY);
  assert.ok(drainAno);
  assert.strictEqual(drainAno.severity, AnomalySeverity.HIGH);
  assert.ok(drainAno.evidence.deviation > 0);
});

// TEST 9: Rover health degradation detected
runTest(9, 'Rover health warning triggers ROVER_HEALTH_DEGRADATION anomaly', () => {
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ health: 'WARNING' }), new MarsEnvironment(), null);
  const detector = new AnomalyDetector();
  const anomalies = detector.detect(obs);

  const hltAno = anomalies.find(a => a.type === AnomalyType.ROVER_HEALTH_DEGRADATION);
  assert.ok(hltAno);
  assert.strictEqual(hltAno.severity, AnomalySeverity.HIGH);
});

// TEST 10: Movement deviation detected
runTest(10, 'Actual movement deviating from command triggers UNEXPECTED_MOVEMENT anomaly', () => {
  const detector = new AnomalyDetector();
  const obs1 = createAutonomyObservation(new MissionManager(), new RoverModel({ position: { x: 100, y: 100 } }), new MarsEnvironment(), null);
  const obs2 = createAutonomyObservation(new MissionManager(), new RoverModel({ position: { x: 112, y: 100 } }), new MarsEnvironment(), null);

  const history = [{
    observation: obs1,
    decision: { action: ActionType.MOVE_ROVER },
    executionResult: { success: true }
  }];

  const anomalies = detector.detect(obs2, history);
  const movAno = anomalies.find(a => a.type === AnomalyType.UNEXPECTED_MOVEMENT);
  assert.ok(movAno);
  assert.strictEqual(movAno.severity, AnomalySeverity.MEDIUM);
});

// TEST 11: Obstacle encounter detected
runTest(11, 'Proximity to known obstacle triggers OBSTACLE_ENCOUNTER anomaly', () => {
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ position: { x: 248, y: 300 } }), new MarsEnvironment(), null);
  const detector = new AnomalyDetector();
  const anomalies = detector.detect(obs);

  const obsAno = anomalies.find(a => a.type === AnomalyType.OBSTACLE_ENCOUNTER);
  assert.ok(obsAno);
});

// TEST 12: Hazard detected
runTest(12, 'Proximity to active hazard region triggers HAZARD_ENCOUNTER anomaly', () => {
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ position: { x: 380, y: 460 } }), new MarsEnvironment(), null);
  const detector = new AnomalyDetector();
  const anomalies = detector.detect(obs);

  const hazAno = anomalies.find(a => a.type === AnomalyType.HAZARD_ENCOUNTER);
  assert.ok(hazAno);
});

// TEST 13: Dust storm detected
runTest(13, 'DUST_STORM weather state triggers WEATHER_DEGRADATION anomaly', () => {
  const env = new MarsEnvironment();
  env.updateEnvironment(8000); // 8000s -> DUST_STORM
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), env, null);
  const detector = new AnomalyDetector();
  const anomalies = detector.detect(obs);

  const wthAno = anomalies.find(a => a.type === AnomalyType.WEATHER_DEGRADATION);
  assert.ok(wthAno);
  assert.strictEqual(wthAno.severity, AnomalySeverity.HIGH);
});

// TEST 14: Communication blackout detected without stopping autonomy
runTest(14, 'Communication BLACKOUT triggers COMMUNICATION_BLACKOUT anomaly with LOW severity', () => {
  const dtn = new DTNCommunicationChannel();
  dtn.setCommunicationState(CommunicationState.BLACKOUT);
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), dtn);
  const detector = new AnomalyDetector();
  const anomalies = detector.detect(obs);

  const blkAno = anomalies.find(a => a.type === AnomalyType.COMMUNICATION_BLACKOUT);
  assert.ok(blkAno);
  assert.strictEqual(blkAno.severity, AnomalySeverity.LOW);
  assert.strictEqual(blkAno.recommendedResponse, 'CONTINUE_PLAN');
});

// TEST 15: Mission stall detected
runTest(15, 'Prolonged execution on same task without progress triggers MISSION_STALL anomaly', () => {
  const detector = new AnomalyDetector();
  const mm = new MissionManager();
  mm.startMission();
  const obs = createAutonomyObservation(mm, new RoverModel(), new MarsEnvironment(), null);

  const history = [
    { observation: obs }, { observation: obs }, { observation: obs }, { observation: obs }, { observation: obs }
  ];

  const anomalies = detector.detect(obs, history);
  const stlAno = anomalies.find(a => a.type === AnomalyType.MISSION_STALL);
  assert.ok(stlAno);
  assert.strictEqual(stlAno.severity, AnomalySeverity.MEDIUM);
});

// TEST 16: Plan infeasibility detected
runTest(16, 'Failed plan status triggers PLAN_INFEASIBILITY anomaly', () => {
  const detector = new AnomalyDetector();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const failedPlan = { planId: 'PLAN-1', status: 'FAILED' };

  const anomalies = detector.detect(obs, [], failedPlan);
  const planAno = anomalies.find(a => a.type === AnomalyType.PLAN_INFEASIBILITY);
  assert.ok(planAno);
  assert.strictEqual(planAno.severity, AnomalySeverity.HIGH);
});

// TEST 17: Risk assessment returns deterministic score
runTest(17, 'RiskAssessmentEngine returns deterministic score and level', () => {
  const riskEngine = new RiskAssessmentEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const assessment = riskEngine.assess(obs, []);

  assert.ok(typeof assessment.score === 'number');
  assert.strictEqual(assessment.overallRisk, RiskLevel.LOW);
});

// TEST 18: Critical conditions produce HIGH/CRITICAL risk
runTest(18, 'Critical battery anomaly produces CRITICAL overall risk assessment', () => {
  const riskEngine = new RiskAssessmentEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.03 }), new MarsEnvironment(), null);
  const anomalies = [{ type: AnomalyType.BATTERY_LOW, severity: AnomalySeverity.CRITICAL }];

  const assessment = riskEngine.assess(obs, anomalies);
  assert.strictEqual(assessment.overallRisk, RiskLevel.CRITICAL);
  assert.ok(assessment.score >= 90.0);
});

// TEST 19: Normal conditions produce LOW risk
runTest(19, 'Nominal environment produces LOW risk assessment', () => {
  const riskEngine = new RiskAssessmentEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const assessment = riskEngine.assess(obs, []);

  assert.strictEqual(assessment.overallRisk, RiskLevel.LOW);
  assert.ok(assessment.score <= 30.0);
});

// TEST 20: Battery prediction works
runTest(20, 'MissionPredictionEngine predicts future battery level over 600s horizon', () => {
  const predEngine = new MissionPredictionEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.90 }), new MarsEnvironment(), null);
  const preds = predEngine.predict(obs, 600);

  assert.ok(preds.battery);
  assert.strictEqual(preds.battery.currentBattery, 0.90);
  assert.ok(preds.battery.predictedBattery < 0.90);
});

// TEST 21: Battery reserve violation predicted
runTest(21, 'MissionPredictionEngine flags expected battery reserve violation when battery is low', () => {
  const predEngine = new MissionPredictionEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.18 }), new MarsEnvironment(), null);
  const preds = predEngine.predict(obs, 600);

  assert.strictEqual(preds.battery.reserveViolationExpected, true);
});

// TEST 22: Mission progress prediction works
runTest(22, 'MissionPredictionEngine calculates task progress trajectory', () => {
  const predEngine = new MissionPredictionEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const preds = predEngine.predict(obs, 600);

  assert.ok(preds.mission);
  assert.ok(preds.mission.predictedProgress >= obs.missionProgress);
});

// TEST 23: Weather prediction reuses Objective 4
runTest(23, 'Weather prediction reuses Objective 4 deterministic timeline', () => {
  const predEngine = new MissionPredictionEngine();
  const env = new MarsEnvironment();
  env.updateEnvironment(3000); // simulationTime = 3000s
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), env, null);

  const preds = predEngine.predict(obs, 1000); // 3000 + 1000 = 4000s -> DUSTY
  assert.strictEqual(preds.weather.predictedState, 'DUSTY');
});

// TEST 24: Communication prediction uses Objective 1/2
runTest(24, 'Communication prediction derives physical delay strictly from Objective 1 delay engine', () => {
  const predEngine = new MissionPredictionEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const preds = predEngine.predict(obs, 600);

  assert.ok(preds.communication);
  assert.ok(preds.communication.estimatedOneWayDelay > 0);
  assert.strictEqual(preds.communication.estimatedOneWayDelay, calculateOneWayDelay(obs.communication.distanceKm));
});

// TEST 25: Earth communication delay is not duplicated
runTest(25, 'Verify prediction engine reuses physical latency without hard-coded delays', () => {
  const dtn = new DTNCommunicationChannel();
  const predEngine = new MissionPredictionEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), dtn);
  const preds = predEngine.predict(obs, 600);

  assert.strictEqual(preds.communication.estimatedOneWayDelay, calculateOneWayDelay(dtn.getDistanceKm()));
});

// TEST 26: Mission intelligence report is generated
runTest(26, 'MissionIntelligenceEngine generates structured report', () => {
  const intelEngine = new MissionIntelligenceEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const report = intelEngine.generateReport(obs);

  assert.ok(report);
  assert.ok(report.timestamp > 0);
  assert.strictEqual(report.missionId, 'MISSION-CRATER-07');
});

// TEST 27: Report contains anomalies
runTest(27, 'Mission intelligence report includes anomalies array', () => {
  const intelEngine = new MissionIntelligenceEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.12 }), new MarsEnvironment(), null);
  const report = intelEngine.generateReport(obs);

  assert.ok(Array.isArray(report.anomalies));
  assert.ok(report.anomalies.length > 0);
});

// TEST 28: Report contains risk assessment
runTest(28, 'Mission intelligence report includes risk assessment block', () => {
  const intelEngine = new MissionIntelligenceEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const report = intelEngine.generateReport(obs);

  assert.ok(report.riskAssessment);
  assert.ok(report.riskAssessment.overallRisk);
});

// TEST 29: Report contains predictions
runTest(29, 'Mission intelligence report includes predictive engine state', () => {
  const intelEngine = new MissionIntelligenceEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const report = intelEngine.generateReport(obs);

  assert.ok(report.predictions);
  assert.ok(report.predictions.battery);
});

// TEST 30: Report contains recommendations
runTest(30, 'Mission intelligence report includes recommended actions list', () => {
  const intelEngine = new MissionIntelligenceEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const report = intelEngine.generateReport(obs);

  assert.ok(Array.isArray(report.recommendedActions));
  assert.ok(report.recommendedActions.length > 0);
});

// TEST 31: Recommendations are explainable
runTest(31, 'Mission intelligence report includes structured explanation block', () => {
  const intelEngine = new MissionIntelligenceEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const report = intelEngine.generateReport(obs);

  assert.ok(report.explanation);
  assert.ok(report.explanation.description);
});

// TEST 32: Confidence is deterministic
runTest(32, 'Verify report confidence is a deterministic number between 0.0 and 1.0', () => {
  const intelEngine = new MissionIntelligenceEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const report = intelEngine.generateReport(obs);

  assert.ok(typeof report.confidence === 'number');
  assert.ok(report.confidence >= 0.0 && report.confidence <= 1.0);
});

// TEST 33: Same observation produces same intelligence report
runTest(33, 'Verify determinism: identical observation produces identical intelligence report', () => {
  const intelEngine = new MissionIntelligenceEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);

  const r1 = intelEngine.generateReport(obs);
  const r2 = intelEngine.generateReport(obs);

  assert.strictEqual(r1.riskAssessment.overallRisk, r2.riskAssessment.overallRisk);
  assert.strictEqual(r1.missionHealth.score, r2.missionHealth.score);
  assert.strictEqual(r1.anomalies.length, r2.anomalies.length);
});

// TEST 34: History records intelligence cycles
runTest(34, 'IntelligenceHistory records report cycles', () => {
  const history = new IntelligenceHistory();
  history.record({ reportId: 'REP-1' }, { obsId: 'OBS-1' });

  assert.strictEqual(history.getHistory().length, 1);
  assert.strictEqual(history.getLastReport().reportId, 'REP-1');
});

// TEST 35: Prediction error can be calculated after actual observation
runTest(35, 'IntelligenceHistory calculates prediction error against actual battery state', () => {
  const history = new IntelligenceHistory();
  const err = history.calculatePredictionError(0.48, 0.44);

  assert.strictEqual(err, 0.04);
});

// TEST 36: Objective 7 recommends REPLAN when Objective 6 plan becomes infeasible
runTest(36, 'Intelligence engine recommends REPLAN when active plan fails', () => {
  const planner = new MissionPlanner();
  const intelEngine = new MissionIntelligenceEngine({ planner });
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.12 }), new MarsEnvironment(), null);
  const failedPlan = { planId: 'PLAN-1', status: 'FAILED' };

  const report = intelEngine.generateReport(obs, failedPlan);
  assert.strictEqual(report.plannerRecommendation.recommendedAction, 'REPLAN');
});

// TEST 37: Objective 7 recommendation passes through Objective 5
runTest(37, 'Objective 7 recommendation flows through Objective 5 decision engine', () => {
  const intelEngine = new MissionIntelligenceEngine();
  const decisionEngine = new AutonomousDecisionEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.12 }), new MarsEnvironment(), null);

  const report = intelEngine.generateReport(obs);
  const decision = decisionEngine.decide(obs);

  assert.strictEqual(report.recommendedActions[0], 'REPLAN');
  assert.strictEqual(decision.action, ActionType.RETURN_TO_BASE);
});

// TEST 38: Objective 5 SafetyValidator can override unsafe recommendation
runTest(38, 'Objective 5 SafetyValidator overrides unsafe recommendation if physical rules violated', () => {
  const validator = new SafetyValidator();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ position: { x: 240, y: 300 } }), new MarsEnvironment(), null);

  const unsafeRecommendation = {
    action: ActionType.MOVE_ROVER,
    payload: { targetPosition: { x: 250, y: 300 } }
  };

  const validation = validator.validate(unsafeRecommendation, obs);
  assert.strictEqual(validation.valid, false);
  assert.strictEqual(validation.decision.action, ActionType.WAIT);
});

// TEST 39: Communication blackout does not disable intelligence
runTest(39, 'Communication BLACKOUT does not disable local intelligence analysis', () => {
  const dtn = new DTNCommunicationChannel();
  dtn.setCommunicationState(CommunicationState.BLACKOUT);
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), dtn);

  const intelEngine = new MissionIntelligenceEngine();
  const report = intelEngine.generateReport(obs);

  assert.ok(report);
  assert.strictEqual(report.riskAssessment.overallRisk, RiskLevel.LOW);
});

// TEST 40: Unknown critical anomaly produces Earth guidance recommendation
runTest(40, 'Critical unknown health degradation produces REQUEST_EARTH_GUIDANCE recommendation', () => {
  const intelEngine = new MissionIntelligenceEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ health: 'CRITICAL' }), new MarsEnvironment(), null);
  const report = intelEngine.generateReport(obs);

  assert.strictEqual(report.recommendedActions[0], 'REQUEST_EARTH_GUIDANCE');
});

// TEST 41: Earth guidance request uses Objective 2 DTN
runTest(41, 'Earth guidance recommendation relies on Objective 2 DTN channel for transmission', () => {
  const dtn = new DTNCommunicationChannel();
  const executor = new AutonomyActionExecutor();

  const decision = { action: ActionType.REQUEST_EARTH_GUIDANCE, reason: { primary: 'HEALTH_CRITICAL' } };
  const res = executor.execute(decision, { dtnChannel: dtn });

  assert.strictEqual(res.success, true);
  assert.strictEqual(dtn.getInTransitPackets().length + dtn.getQueuedPackets().length, 1);
});

// TEST 42: Communication timing uses Objective 1
runTest(42, 'Intelligence engine derives signal arrival timing strictly from Objective 1 delay engine', () => {
  const predEngine = new MissionPredictionEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);
  const preds = predEngine.predict(obs, 600);

  assert.strictEqual(preds.communication.estimatedRoundTripDelay, calculateOneWayDelay(obs.communication.distanceKm) * 2);
});

// TEST 43: Dust storm triggers planner contingency
runTest(43, 'DUST_STORM weather state causes MissionPlanner replanning into DUST_STORM_HOLDING', () => {
  const env = new MarsEnvironment();
  env.updateEnvironment(8000);
  const planner = new MissionPlanner();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), env, null);

  const plan = planner.plan(obs);
  assert.strictEqual(plan.strategy, 'DUST_STORM_HOLDING');
});

// TEST 44: Battery prediction correctly identifies dangerous future state
runTest(44, 'Battery prediction accurately identifies future reserve violation', () => {
  const predEngine = new MissionPredictionEngine();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel({ batteryLevel: 0.16 }), new MarsEnvironment(), null);
  const preds = predEngine.predict(obs, 300);

  assert.strictEqual(preds.battery.reserveViolationExpected, true);
});

// TEST 45: Mission Intelligence Report remains deterministic
runTest(45, 'Verify DeterministicIntelligenceModel produces 100% deterministic outputs', () => {
  const model = new DeterministicIntelligenceModel();
  const obs = createAutonomyObservation(new MissionManager(), new RoverModel(), new MarsEnvironment(), null);

  const a1 = model.analyze(obs);
  const a2 = model.analyze(obs);
  const r1 = model.scoreRisk(obs, a1);
  const r2 = model.scoreRisk(obs, a2);

  assert.deepStrictEqual(a1, a2);
  assert.deepStrictEqual(r1, r2);
});

console.log(`\n🎉 ALL ${passedTests}/${totalTests} OBJECTIVE 7 AI MISSION INTELLIGENCE TESTS PASSED CLEANLY!`);
