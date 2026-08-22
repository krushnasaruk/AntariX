import { useState } from 'react';

export function useLatency(initialDelay = 5) {
  const [latencySec, setLatencySec] = useState(initialDelay);

  const setPreset = (presetName) => {
    switch (presetName) {
      case 'DEMO':
        setLatencySec(0);
        break;
      case 'OPPOSITION':
        setLatencySec(204); // ~3.4 mins
        break;
      case 'CONJUNCTION':
        setLatencySec(1344); // ~22.4 mins
        break;
      default:
        setLatencySec(5);
    }
  };

  return { latencySec, setLatencySec, setPreset };
}
