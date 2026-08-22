export function formatSecondsToTime(seconds) {
  if (seconds <= 0) return '00:00:00 (DEMO ZERO DELAY)';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s (${seconds}s delay)`;
}

export function formatSolTime(sol, timestamp) {
  const date = new Date(timestamp);
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const mins = String(date.getUTCMinutes()).padStart(2, '0');
  const secs = String(date.getUTCSeconds()).padStart(2, '0');
  return `SOL ${sol} | ${hours}:${mins}:${secs} MTC`;
}
