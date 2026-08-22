import express from 'express';
import {
  PythonIntelligenceAdapter,
  PythonLearningAdapter,
  createAutonomyObservation
} from '../../../../../packages/simulation-core/index.js';
import { activeSimulation } from './simulationRoutes.js';

const router = express.Router();
const intelligenceAdapter = new PythonIntelligenceAdapter({ baseUrl: 'http://localhost:8000' });
const learningAdapter = new PythonLearningAdapter({ baseUrl: 'http://localhost:8000' });

function getCurrentObservation() {
  return createAutonomyObservation(
    activeSimulation.missionManager,
    activeSimulation.rover,
    activeSimulation.env,
    activeSimulation.channel
  );
}

// GET /api/intelligence/analyze
router.get('/analyze', async (req, res) => {
  const obs = getCurrentObservation();
  try {
    const report = await intelligenceAdapter.analyze(obs);
    res.json({
      success: true,
      source: report.source || 'PythonIntelligenceService (:8000) / PythonIntelligenceAdapter',
      data: report
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/intelligence/learning
router.get('/learning', async (req, res) => {
  const obs = getCurrentObservation();
  try {
    const stats = await learningAdapter.getLearningStatistics();
    const strategies = await learningAdapter.getStrategyPerformances();
    const failures = await learningAdapter.getFailurePatterns();

    res.json({
      success: true,
      source: 'PythonLearningService (:8000) / AdaptivePlanningEngine',
      data: {
        statistics: stats || { totalExperiences: 0, coldStart: true },
        strategies: strategies || [],
        failures: failures || []
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
