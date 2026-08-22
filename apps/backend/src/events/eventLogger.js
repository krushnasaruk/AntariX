import { store } from '../database/store.js';

export function logEvent(category, severity, message, metadata = {}) {
  const event = {
    category,
    severity,
    message,
    metadata
  };
  store.addEvent(event);
  console.log(`[EVENT ${severity}] (${category}): ${message}`);
  return event;
}
