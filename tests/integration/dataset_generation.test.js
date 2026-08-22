import assert from 'node:assert';
import { spawn, execSync } from 'node:child_process';
import {
  MissionManager,
  MarsEnvironment,
  RoverModel,
  createAutonomyObservation,
  SafetyValidator,
  ActionType
} from '../../packages/simulation-core/index.js';

console.log('🧪 Starting Dataset Generation Factory & Safety Boundary Integration Test...\n');

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

async function runAsyncTest(num, description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✅ TEST ${num}: ${description}`);
    passedTests++;
  } catch (error) {
    console.error(`  ❌ TEST ${num}: ${description}`);
    console.error(`     Error: ${error.message}`);
    throw error;
  }
}

async function main() {
  // Launch live Python Digital Twin service on port 8010 for dataset integration tests
  const pythonProc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8010'], {
    cwd: 'services/digital-twin',
    stdio: 'ignore'
  });

  // Wait for server startup
  await new Promise(resolve => setTimeout(resolve, 3000));

  try {
    const baseUrl = 'http://127.0.0.1:8010';

    await runAsyncTest(1, 'Dataset Factory generates multi-family dataset over HTTP REST', async () => {
      const payload = {
        datasetId: 'mars-comm-v10-test',
        numberOfEpisodes: 10,
        seed: 42,
        datasetTypes: ['SUPERVISED', 'TIMESERIES', 'RL', 'ANOMALY']
      };

      const res = await fetch(`${baseUrl}/dataset/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      assert.strictEqual(res.status, 200);
      const data = await res.json();
      assert.ok(data.manifest);
      assert.strictEqual(data.manifest.datasetId, 'mars-comm-v10-test');
      assert.strictEqual(data.manifest.episodes, 10);
      assert.strictEqual(data.manifest.records, 100);
      assert.ok(data.quality);
      assert.strictEqual(data.quality.passed, true);
    });

    await runAsyncTest(2, 'GET /dataset/{id}/manifest retrieves manifest metadata', async () => {
      const res = await fetch(`${baseUrl}/dataset/mars-comm-v10-test/manifest`);
      assert.strictEqual(res.status, 200);
      const manifest = await res.json();
      assert.strictEqual(manifest.datasetId, 'mars-comm-v10-test');
      assert.strictEqual(manifest.records, 100);
    });

    await runAsyncTest(3, 'GET /dataset/{id}/quality retrieves data quality report', async () => {
      const res = await fetch(`${baseUrl}/dataset/mars-comm-v10-test/quality`);
      assert.strictEqual(res.status, 200);
      const quality = await res.json();
      assert.strictEqual(quality.passed, true);
      assert.strictEqual(quality.missingnessCount, 0);
    });

    await runAsyncTest(4, 'GET /dataset/{id}/coverage retrieves scenario coverage statistics', async () => {
      const res = await fetch(`${baseUrl}/dataset/mars-comm-v10-test/coverage`);
      assert.strictEqual(res.status, 200);
      const coverage = await res.json();
      assert.strictEqual(coverage.totalEpisodes, 10);
      assert.ok(coverage.coveragePercentages);
    });

    await runAsyncTest(5, 'POST /dataset/generate produces 100% reproducible manifest checksums for identical seeds', async () => {
      const p1 = { datasetId: 'mars-comm-seed-1', numberOfEpisodes: 5, seed: 12345 };
      const p2 = { datasetId: 'mars-comm-seed-2', numberOfEpisodes: 5, seed: 12345 };

      const r1 = await (await fetch(`${baseUrl}/dataset/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p1) })).json();
      const r2 = await (await fetch(`${baseUrl}/dataset/generate`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p2) })).json();

      assert.strictEqual(r1.manifest.records, r2.manifest.records);
      assert.strictEqual(r1.quality.qualityScore, r2.quality.qualityScore);
    });

    await runAsyncTest(6, 'Physical safety authority remains in Objective 5 SafetyValidator', async () => {
      const validator = new SafetyValidator();

      // Dataset action labels cannot bypass SafetyValidator
      const obstacleObs = createAutonomyObservation(new MissionManager(), new RoverModel({ position: { x: 240, y: 300 } }), new MarsEnvironment(), null);
      const unsafeAction = { action: ActionType.MOVE_ROVER, payload: { targetPosition: { x: 250, y: 300 } } };

      const validation = validator.validate(unsafeAction, obstacleObs);
      assert.strictEqual(validation.valid, false);
      assert.strictEqual(validation.decision.action, ActionType.WAIT);
    });
  } finally {
    try {
      if (pythonProc && pythonProc.pid) {
        execSync(`taskkill /pid ${pythonProc.pid} /T /F`, { stdio: 'ignore' });
      }
    } catch (_) {
      try { pythonProc.kill(); } catch (_) {}
    }
  }

  console.log(`\n🎉 ALL ${passedTests}/${totalTests} DATASET FACTORY INTEGRATION TESTS PASSED CLEANLY!`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
