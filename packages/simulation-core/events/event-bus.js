/**
 * INTERNAL EVENT BUS & OBSERVABLE EVENT SYSTEM
 * Lightweight pub/sub event architecture coexisting with synchronous step() API.
 */

export const EventCategory = {
  MISSION: 'MissionEvent',
  ROVER: 'RoverEvent',
  ENVIRONMENT: 'EnvironmentEvent',
  COMMUNICATION: 'CommunicationEvent',
  SAFETY: 'SafetyEvent',
  INTELLIGENCE: 'IntelligenceEvent',
  PLANNING: 'PlanningEvent',
  LEARNING: 'LearningEvent'
};

export class SimulationEventBus {
  constructor() {
    this.listeners = new Map();
    this.eventLog = [];
    this.maxLogSize = 1000;
  }

  /**
   * Subscribes a listener to a specific event category or all events ('*').
   * @param {string} category 
   * @param {Function} handler 
   * @returns {Function} Unsubscribe function
   */
  subscribe(category, handler) {
    if (!this.listeners.has(category)) {
      this.listeners.set(category, new Set());
    }
    this.listeners.get(category).add(handler);
    return () => this.unsubscribe(category, handler);
  }

  unsubscribe(category, handler) {
    if (this.listeners.has(category)) {
      this.listeners.get(category).delete(handler);
    }
  }

  /**
   * Publishes an event to all subscribers and records it to immutable eventLog.
   * @param {string} category 
   * @param {string} eventName 
   * @param {Object} payload 
   * @param {number} [simTime=0.0] 
   * @returns {Object} Structured event record
   */
  publish(category, eventName, payload = {}, simTime = 0.0) {
    const eventRecord = {
      eventId: `EVT-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      category,
      name: eventName,
      timestamp: Date.now(),
      simulationTime: simTime,
      payload: { ...payload }
    };

    this.eventLog.push(eventRecord);
    if (this.eventLog.length > this.maxLogSize) {
      this.eventLog.shift();
    }

    // Notify specific category listeners
    if (this.listeners.has(category)) {
      for (const handler of this.listeners.get(category)) {
        try {
          handler(eventRecord);
        } catch (err) {
          console.error(`Error in event handler for ${category}:${eventName}:`, err);
        }
      }
    }

    // Notify wildcard '*' listeners
    if (this.listeners.has('*')) {
      for (const handler of this.listeners.get('*')) {
        try {
          handler(eventRecord);
        } catch (err) {
          console.error(`Error in wildcard event handler:`, err);
        }
      }
    }

    return eventRecord;
  }

  getEventHistory(category = null) {
    if (!category) return [...this.eventLog];
    return this.eventLog.filter(e => e.category === category);
  }

  clear() {
    this.eventLog = [];
    this.listeners.clear();
  }
}

// Global default singleton
export const globalEventBus = new SimulationEventBus();
