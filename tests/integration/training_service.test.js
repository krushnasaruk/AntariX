import assert from 'assert';
import { spawn, execSync } from 'child_process';
import { PythonTrainingAdapter } from '../../packages/simulation-core/ml/python-training-adapter.js';
import { SafetyValidator, ActionType, MissionManager, RoverModel, MarsEnvironment, createAutonomyObservation } from '../../packages/simulation-core/index.js';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

let passedTests = 0;
let totalTests = 0;

async function runAsyncTest(num, name, testFn) {
  totalTests++;
  try {
    await testFn();
    console.log(`  ✅ TEST ${num}: ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ❌ TEST ${num}: ${name}\n     Error: ${err.message}`);
    throw err;
  }
}

async function main() {
  console.log('🧪 Starting Objective 12 Production Training Engine Integration Test...\n');

  // TEST 1 & 2: Offline tests
  const offlineAdapter = new PythonTrainingAdapter({ serviceUrl: 'http://127.0.0.1:59999' });

  await runAsyncTest(1, 'PythonTrainingAdapter instantiates with default service URL', async () => {
    const adapter = new PythonTrainingAdapter();
    assert.strictEqual(adapter.serviceUrl, 'http://127.0.0.1:8012');
  });

  await runAsyncTest(2, 'PythonTrainingAdapter handles offline service gracefully with fallback response', async () => {
    const res = await offlineAdapter.createJobAsync({ jobId: 'JOB-OFFLINE' });
    assert.ok(res);
    assert.strictEqual(res.offlineFallback, true);
    assert.strictEqual(res.status, 'QUEUED');
  });

  // Start live Python Training Service on port 8012
  const pythonProc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8012'], {
    cwd: 'services/training-engine',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
    stdio: 'ignore'
  });

  let healthy = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:8012/health');
      if (res.ok) {
        healthy = true;
        break;
      }
    } catch (e) {}
    await sleep(500);
  }
  assert.ok(healthy, 'Python Training Service failed to boot within 15 seconds');

  const adapter = new PythonTrainingAdapter({ serviceUrl: 'http://127.0.0.1:8012' });

  try {
    await runAsyncTest(3, 'Live Python Training Service registers GPU worker node', async () => {
      const regRes = await adapter.registerWorkerAsync('W-GPU-4050', 'rtx-4050-laptop');
      assert.ok(regRes);
      assert.strictEqual(regRes.workerId, 'W-GPU-4050');
    });

    await runAsyncTest(4, 'Live Python Training Service creates training job', async () => {
      const jobRes = await adapter.createJobAsync({ jobId: 'JOB-INT-100', modelType: 'RL', algorithm: 'PPO' });
      assert.ok(jobRes);
      assert.strictEqual(jobRes.jobId, 'JOB-INT-100');
    });

    await runAsyncTest(5, 'Live Python Training Service executes safety-aware RL job with Objective 5 gatekeeping', async () => {
      const startRes = await adapter.startJobAsync('JOB-INT-100');
      assert.ok(startRes);
      assert.ok(startRes.job);
      assert.strictEqual(startRes.job.status, 'COMPLETED');
      assert.ok(startRes.result.safetyMetrics.safetyInterventions >= 0);
    });

    await runAsyncTest(6, 'Physical safety authority remains in Objective 5 SafetyValidator', async () => {
      const validator = new SafetyValidator();

      // Low battery observation (battery = 0.03)
      const lowBatRover = new RoverModel({ batteryLevel: 0.03 });
      const lowBatObs = createAutonomyObservation(new MissionManager(), lowBatRover, new MarsEnvironment(), null);
      const moveAction = { action: ActionType.MOVE_ROVER, payload: { targetPosition: { x: 110, y: 100 } } };

      const validation = validator.validate(moveAction, lowBatObs);
      assert.strictEqual(validation.valid, false);
      assert.ok(validation.decision.action === ActionType.RETURN_TO_BASE || validation.decision.action === ActionType.WAIT);
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

  console.log(`\n🎉 ALL ${passedTests}/${totalTests} PYTHON TRAINING SERVICE INTEGRATION TESTS PASSED CLEANLY!`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
