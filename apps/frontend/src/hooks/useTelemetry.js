import { useState, useEffect } from 'react';
import { connectTelemetryWebSocket } from '../services/websocket/socketClient.js';

export function useTelemetry() {
  const [telemetry, setTelemetry] = useState(null);
  const [opticalLink, setOpticalLink] = useState(null);
  const [latencySec, setLatencySec] = useState(5);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const ws = connectTelemetryWebSocket((payload) => {
      setConnected(true);
      if (payload.telemetry) setTelemetry(payload.telemetry);
      if (payload.opticalLink) setOpticalLink(payload.opticalLink);
      if (payload.latencySec !== undefined) setLatencySec(payload.latencySec);
    }, () => {
      setConnected(false);
    });

    return () => {
      ws.close();
    };
  }, []);

  return { telemetry, opticalLink, latencySec, connected };
}
