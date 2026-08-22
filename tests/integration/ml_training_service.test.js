import assert from 'assert';
import { spawn, execSync } from 'child_process';
import { PythonMLAdapter } from '../../packages/simulation-core/ml/python-ml-adapter.js';
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
  console.log('🧪 Starting Python ML Training Service & Safety Boundary Integration Test...\n');

  // TEST 1 & 2: Offline tests
  const offlineAdapter = new PythonMLAdapter({ serviceUrl: 'http://localhost:59999' });

  await runAsyncTest(1, 'PythonMLAdapter instantiates with default service URL', async () => {
    const adapter = new PythonMLAdapter();
    assert.strictEqual(adapter.serviceUrl, 'http://127.0.0.1:8011');
  });

  await runAsyncTest(2, 'PythonMLAdapter handles offline service gracefully with fallback response', async () => {
    const res = await offlineAdapter.predictAsync('MODEL-OFFLINE', {});
    assert.ok(res);
    assert.strictEqual(res.offlineFallback, true);
    assert.strictEqual(res.prediction, 'MOVE_ROVER');
  });

  // Start live Python ML Service on port 8011
  const pythonProc = spawn('python', ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8011'], {
    cwd: 'services/ml-engine',
    env: { ...process.env, PYTHONUNBUFFERED: '1' },
    stdio: 'ignore'
  });
  pythonProc.on('exit', (code, signal) => {
    console.log(`[PYTHON-PROC-EXIT] Process exited with code ${code}, signal ${signal}`);
  });

  // Wait up to 15s for Python ML service to become healthy
  let healthy = false;
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch('http://127.0.0.1:8011/models/health');
      if (res.ok) {
        healthy = true;
        break;
      }
    } catch (e) {}
    await sleep(500);
  }
  assert.ok(healthy, 'Python ML Service failed to boot within 15 seconds');

  const adapter = new PythonMLAdapter({ serviceUrl: 'http://127.0.0.1:8011' });

  try {
    await runAsyncTest(3, 'Live Python ML Service accepts POST /models/train and registers model', async () => {
      const trainRes = await adapter.trainModelAsync('int-exp', 'MODEL-INT-001', 'RANDOM_FOREST', 'mars-comm-v1', 42);
      assert.ok(trainRes);
      assert.notStrictEqual(trainRes.offlineFallback, true, `trainModelAsync hit fallback: ${JSON.stringify(trainRes)}`);
      assert.strictEqual(trainRes.modelId, 'MODEL-INT-001');
    });

    await runAsyncTest(4, 'Live Python ML Service accepts POST /models/predict and returns prediction', async () => {
      const obs = {
        timestamp: 100.0,
        rover: { position: { x: 100, y: 100 }, batteryLevel: 0.94 },
        environment: { weather: { state: 'CLEAR' } },
        communication: { communicationState: 'AVAILABLE' }
      };
      const predRes = await adapter.predictAsync('MODEL-INT-001', obs);
      assert.ok(predRes);
      assert.strictEqual(predRes.modelId, 'MODEL-INT-001');
      assert.ok(predRes.confidence > 0.0);
    });

    await runAsyncTest(5, 'Live Python ML Service returns registry metadata', async () => {
      const regList = await adapter.getRegistryAsync();
      assert.ok(Array.isArray(regList));
      assert.ok(regList.length >= 1);
    });

    await runAsyncTest(6, 'Physical safety authority remains in Objective 5 SafetyValidator', async () => {
      const validator = new SafetyValidator();

      // Depleted battery observation (battery = 0.03)
      const lowBatRover = new RoverModel({ batteryLevel: 0.03 });
      const lowBatObs = createAutonomyObservation(new MissionManager(), lowBatRover, new MarsEnvironment(), null);
      const moveAction = { action: ActionType.MOVE_ROVER, payload: { targetPosition: { x: 110, y: 100 } } };

      // SafetyValidator overrides unsafe action with WAIT
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

  console.log(`\n🎉 ALL ${passedTests}/${totalTests} PYTHON ML SERVICE INTEGRATION TESTS PASSED CLEANLY!`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
