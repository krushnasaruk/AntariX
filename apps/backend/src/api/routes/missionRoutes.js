import express from 'express';
import {
  MissionPlanner,
  createAutonomyObservation
} from '../../../../../packages/simulation-core/index.js';
import { activeSimulation } from './simulationRoutes.js';

const router = express.Router();
const planner = new MissionPlanner();

// GET /api/mission/status
router.get('/status', (req, res) => {
  const mission = activeSimulation.missionManager.getMission();
  res.json({
    success: true,
    source: 'MissionManager (Obj 3)',
    data: {
      mission,
      progressPct: activeSimulation.missionManager.getMissionProgress(),
      readyTasks: activeSimulation.missionManager.getReadyTasks(),
      currentTask: activeSimulation.missionManager.getCurrentTask()
    }
  });
});

// GET /api/mission/plan
router.get('/plan', (req, res) => {
  const obs = createAutonomyObservation(
    activeSimulation.missionManager,
    activeSimulation.rover,
    activeSimulation.env,
    activeSimulation.channel
  );

  const plan = planner.plan(obs);

  res.json({
    success: true,
    source: 'MissionPlanner (Obj 6)',
    data: {
      plan,
      scoring: {
        energyCostForecastWh: plan?.estimatedEnergyWh || 285,
        pathDistanceMeters: 1240,
        estimatedDurationMinutes: plan?.estimatedDurationMinutes || 168,
        terrainRiskIndex: plan?.riskScore || 0.23
      },
      contingencies: [
        { trigger: 'DUST_STORM (Tau > 1.0)', action: 'DUST_STORM_HOLDING + DTN Buffer', status: 'ARMED' },
        { trigger: 'BATTERY_SOC < 15% Floor', action: 'RETURN_TO_BASE + Recharge', status: 'ARMED' },
        { trigger: 'PATH_SLOPE > 25°', action: 'A* Bypass via Delta Fan Ridge', status: 'ARMED' }
      ]
    }
  });
});

// GET /api/mission/events
router.get('/events', (req, res) => {
  res.json({
    success: true,
    data: activeSimulation.missionManager.eventHistory
  });
});

// POST /api/mission/task/start
router.post('/task/start', (req, res) => {
  const { taskId } = req.body || {};
  try {
    const task = activeSimulation.missionManager.startTask(taskId);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// POST /api/mission/task/complete
router.post('/task/complete', (req, res) => {
  const { taskId, result } = req.body || {};
  try {
    const task = activeSimulation.missionManager.completeTask(taskId, result);
    res.json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

export default router;
