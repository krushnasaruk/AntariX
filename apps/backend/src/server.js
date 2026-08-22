import express from 'express';
import http from 'http';
import cors from 'cors';
import { config } from './config/index.js';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/errorHandler.js';
import { setupWebSocketServer } from './websocket/wsServer.js';

import simulationRoutes from './api/routes/simulationRoutes.js';
import autonomyRoutes from './api/routes/autonomyRoutes.js';
import missionRoutes from './api/routes/missionRoutes.js';
import intelligenceRoutes from './api/routes/intelligenceRoutes.js';
import communicationRoutes from './api/routes/communicationRoutes.js';
import digitalTwinRoutes from './api/routes/digitalTwinRoutes.js';
import mlTrainingRoutes from './api/routes/mlTrainingRoutes.js';
import benchmarkRoutes from './api/routes/benchmarkRoutes.js';
import telemetryRoutes from './api/routes/telemetryRoutes.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'AntriX Deep Space Gateway',
    timestamp: Date.now()
  });
});

// Canonical Subsystem Routes
app.use('/api/simulation', simulationRoutes);
app.use('/api/autonomy', autonomyRoutes);
app.use('/api/mission', missionRoutes);
app.use('/api/intelligence', intelligenceRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/command', communicationRoutes);
app.use('/api/digital-twin', digitalTwinRoutes);
app.use('/api/ml', mlTrainingRoutes);
app.use('/api/training', mlTrainingRoutes);
app.use('/api/benchmarks', benchmarkRoutes);
app.use('/api/telemetry', telemetryRoutes);

app.use(errorHandler);

const httpServer = http.createServer(app);
setupWebSocketServer(httpServer);

httpServer.listen(config.port, () => {
  console.log(`📡 [ANTRIX DEEP SPACE GATEWAY RUNNING]: http://localhost:${config.port}`);
});
