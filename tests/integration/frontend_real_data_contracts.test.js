import http from 'http';
import express from 'express';
import cors from 'cors';
import simulationRoutes, { activeSimulation } from '../../apps/backend/src/api/routes/simulationRoutes.js';
import autonomyRoutes from '../../apps/backend/src/api/routes/autonomyRoutes.js';
import missionRoutes from '../../apps/backend/src/api/routes/missionRoutes.js';
import intelligenceRoutes from '../../apps/backend/src/api/routes/intelligenceRoutes.js';
import communicationRoutes from '../../apps/backend/src/api/routes/communicationRoutes.js';
import digitalTwinRoutes from '../../apps/backend/src/api/routes/digitalTwinRoutes.js';
import mlTrainingRoutes from '../../apps/backend/src/api/routes/mlTrainingRoutes.js';
import benchmarkRoutes from '../../apps/backend/src/api/routes/benchmarkRoutes.js';

console.log('🧪 Starting Frontend Real Data Contract & Zero-Dummy Integration Tests...\n');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/simulation', simulationRoutes);
app.use('/api/autonomy', autonomyRoutes);
app.use('/api/mission', missionRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/digital-twin', digitalTwinRoutes);
app.use('/api/ml', mlTrainingRoutes);
app.use('/api/training', mlTrainingRoutes);
app.use('/api/benchmarks', benchmarkRoutes);

const server = http.createServer(app);
const PORT = 3099;
const BASE_URL = `http://127.0.0.1:${PORT}/api`;

function assert(condition, message) {
  if (!condition) {
    console.error(`  ❌ FAILED: ${message}`);
    process.exit(1);
  }
}

server.listen(PORT, async () => {
  try {
    // 1. World State Contract
    console.log('  Testing GET /api/simulation/world-state...');
    const wsRes = await fetch(`${BASE_URL}/simulation/world-state`);
    const wsJson = await wsRes.json();
    assert(wsJson.success === true, 'WorldState response success is true');
    assert(wsJson.data.rover.batteryLevel > 0, 'Rover battery is positive real number');
    assert(wsJson.data.rover.position.x !== undefined, 'Rover position X is defined');
    assert(wsJson.data.environment.gravityMps2 === 3.721, 'Mars gravity constant is 3.721');
    assert(wsJson.data.communication.oneWayDelaySec > 0, 'One-way delay derived from distance');
    console.log('  ✅ TEST 1: Canonical WorldState contract verified');

    // 2. Simulation Step and Fault Injection
    console.log('  Testing POST /api/simulation/step and fault injection...');
    const stepRes = await fetch(`${BASE_URL}/simulation/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dt: 5.0 })
    });
    const stepJson = await stepRes.json();
    assert(stepJson.success === true, 'Step returned success');

    const faultRes = await fetch(`${BASE_URL}/simulation/fault/inject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ faultType: 'DUST_STORM' })
    });
    const faultJson = await faultRes.json();
    assert(faultJson.success === true, 'Fault injection returned success');
    assert(faultJson.data.environment.weather === 'DUST_STORM', 'Weather changed to DUST_STORM');
    console.log('  ✅ TEST 2: Simulation step & fault injection verified');

    // 3. Autonomy Decisions & Safety Invariants
    console.log('  Testing GET /api/autonomy/decision and /invariants...');
    const decRes = await fetch(`${BASE_URL}/autonomy/decision`);
    const decJson = await decRes.json();
    assert(decJson.success === true, 'Autonomy decision returned success');
    assert(decJson.data.safetyValidation !== undefined, 'SafetyValidation block present');

    const invRes = await fetch(`${BASE_URL}/autonomy/invariants`);
    const invJson = await invRes.json();
    assert(Array.isArray(invJson.data) && invJson.data.length >= 5, 'Safety invariants array returned');
    console.log('  ✅ TEST 3: Autonomy decision & physical invariants verified');

    // 4. Mission Planner & Multi-Factor Scoring
    console.log('  Testing GET /api/mission/plan...');
    const planRes = await fetch(`${BASE_URL}/mission/plan`);
    const planJson = await planRes.json();
    assert(planJson.success === true, 'Mission plan returned success');
    assert(planJson.data.scoring.energyCostForecastWh > 0, 'Energy forecast calculated');
    console.log('  ✅ TEST 4: Mission planner & multi-factor scoring verified');

    // 5. Communication & DTN Transmission
    console.log('  Testing POST /api/communication/send...');
    const commRes = await fetch(`${BASE_URL}/communication/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commandType: 'COLLECT_SAMPLE', priority: 'CRITICAL' })
    });
    const commJson = await commRes.json();
    assert(commJson.success === true, 'DTN packet accepted for transmission');
    assert(commJson.packet.priority === 'CRITICAL', 'Priority preserved in DTN packet');
    console.log('  ✅ TEST 5: DTN communication transmission verified');

    // 6. Benchmark Suite & Multi-Policy Numbers
    console.log('  Testing GET /api/benchmarks/results...');
    const benchRes = await fetch(`${BASE_URL}/benchmarks/results`);
    const benchJson = await benchRes.json();
    assert(benchJson.success === true, 'Benchmark results returned success');
    assert(benchJson.data.policies.RL_POLICY !== undefined, 'RL policy benchmark exists');
    assert(benchJson.data.policies.RULE_BASED !== undefined, 'Rule-based benchmark exists');
    console.log('  ✅ TEST 6: Multi-policy benchmark numbers verified');

    console.log('\n🎉 ALL 6/6 FRONTEND DATA CONTRACT TESTS PASSED CLEANLY!\n');
    if (server.closeAllConnections) server.closeAllConnections();
    server.close();
    setTimeout(() => process.exit(0), 100);
  } catch (err) {
    console.error('❌ Contract test error:', err);
    if (server.closeAllConnections) server.closeAllConnections();
    server.close();
    setTimeout(() => process.exit(1), 100);
  }
});
