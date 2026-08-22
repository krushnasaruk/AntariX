import { WebSocketServer } from 'ws';
import { activeSimulation } from '../api/routes/simulationRoutes.js';

export function setupWebSocketServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer });

  wss.on('connection', (ws) => {
    console.log('[WEBSOCKET]: Client connected to Deep Space Telemetry Stream');

    // Send immediate initial snapshot
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({
        type: 'WORLD_STATE_UPDATE',
        timestamp: Date.now(),
        worldState: activeSimulation.getWorldState()
      }));
    }

    const interval = setInterval(() => {
      if (ws.readyState === ws.OPEN) {
        // Step simulation physics slightly for realistic live movement
        activeSimulation.step(1.0);

        ws.send(JSON.stringify({
          type: 'WORLD_STATE_UPDATE',
          timestamp: Date.now(),
          worldState: activeSimulation.getWorldState()
        }));
      }
    }, 1000);

    ws.on('close', () => {
      clearInterval(interval);
      console.log('[WEBSOCKET]: Client disconnected');
    });
  });

  return wss;
}
