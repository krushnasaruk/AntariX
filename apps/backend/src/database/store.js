/**
 * In-memory Datastore for Mission State, Telemetry, and Queued Commands
 */
export class MissionDataStore {
  constructor() {
    this.telemetryHistory = [];
    this.queuedCommands = [];
    this.events = [];
    this.activeMission = {
      id: 'MISSION-JEZERO-07',
      name: 'Jezero Crater Sample Return & AI Surface Operations',
      sol: 142,
      roverName: 'Perseverance-II',
      status: 'IN_PROGRESS',
      waypointIndex: 2,
      waypoints: [
        { id: 1, name: 'Alpha Site - Landing', x: 100, y: 150, status: 'COMPLETED' },
        { id: 2, name: 'Bravo Ridge - Delta Fan', x: 280, y: 320, status: 'ACTIVE' },
        { id: 3, name: 'Charlie Basin - Clay Deposit', x: 450, y: 580, status: 'PENDING' },
        { id: 4, name: 'Delta Crater Edge', x: 800, y: 720, status: 'PENDING' }
      ]
    };
  }

  addTelemetry(data) {
    this.telemetryHistory.push(data);
    if (this.telemetryHistory.length > 500) {
      this.telemetryHistory.shift();
    }
  }

  addCommand(cmd) {
    this.queuedCommands.push(cmd);
  }

  addEvent(event) {
    this.events.push({
      id: 'EVT-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: Date.now(),
      ...event
    });
    if (this.events.length > 200) {
      this.events.shift();
    }
  }
}

export const store = new MissionDataStore();
