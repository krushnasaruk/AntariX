import express from 'express';
import { getLatestTelemetry, getTelemetryHistory } from '../controllers/telemetryController.js';

const router = express.Router();
router.get('/latest', getLatestTelemetry);
router.get('/history', getTelemetryHistory);

export default router;
