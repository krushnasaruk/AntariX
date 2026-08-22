import { WS_URL } from '../../utils/constants.js';

export function connectTelemetryWebSocket(onMessage, onError) {
  const ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    console.log('[FRONTEND WS]: Connected to Deep Space Telemetry Stream');
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (e) {
      console.error('[FRONTEND WS]: Failed to parse WS message', e);
    }
  };

  ws.onerror = (err) => {
    if (onError) onError(err);
  };

  return ws;
}
