export const API_BASE_URL = 'http://localhost:3000/api';
export const WS_URL = 'ws://localhost:3000';

export const AI_SERVICE_URL = 'http://127.0.0.1:8000';
export const TWIN_SERVICE_URL = 'http://127.0.0.1:8010';
export const ML_SERVICE_URL = 'http://127.0.0.1:8011';
export const TRAINING_SERVICE_URL = 'http://127.0.0.1:8012';

export const PAGES = {
  DASHBOARD: 'Dashboard',
  COMMUNICATION: 'Communication',
  SIMULATION: 'Simulation',
  ROVER: 'Rover Subsystems',
  AI: 'AI Executive',
  MISSION: 'Mission Plan',
  TELEMETRY: 'Telemetry Stream',
  DATA_QUEUE: 'DTN Packet Queue',
  DIGITAL_TWIN: 'Digital Twin',
  ML_REGISTRY: 'ML Registry',
  TRAINING: 'Training Engine',
  SAFETY_GATE: 'Safety Gate',
  EVENTS: 'System Events'
};

export const NAV_GROUPS = [
  {
    label: 'OPERATIONS',
    items: [
      PAGES.DASHBOARD,
      PAGES.COMMUNICATION,
      PAGES.ROVER,
      PAGES.SIMULATION
    ]
  },
  {
    label: 'INTELLIGENCE',
    items: [
      PAGES.AI,
      PAGES.SAFETY_GATE,
      PAGES.MISSION,
      PAGES.TELEMETRY
    ]
  },
  {
    label: 'DATA & ML',
    items: [
      PAGES.DATA_QUEUE,
      PAGES.DIGITAL_TWIN,
      PAGES.ML_REGISTRY,
      PAGES.TRAINING
    ]
  },
  {
    label: 'SYSTEM',
    items: [
      PAGES.EVENTS
    ]
  }
];

export const ORBITAL_PRESETS = {
  OPPOSITION: { label: 'Opposition', distanceKm: 54600000, delaySec: 182 },
  NOMINAL: { label: 'Nominal', distanceKm: 225000000, delaySec: 751 },
  CONJUNCTION: { label: 'Conjunction', distanceKm: 401000000, delaySec: 1338 }
};

export const COMMAND_TYPES = [
  { value: 'MOVE_TO', label: 'MOVE_TO — Waypoint Navigation' },
  { value: 'DRILL_SAMPLE', label: 'DRILL_SAMPLE — Science Core Sample' },
  { value: 'ANALYZE_ATMOSPHERE', label: 'ANALYZE_ATMOSPHERE — Spectrometer' },
  { value: 'ENTER_SAFE_MODE', label: 'ENTER_SAFE_MODE — Emergency Preserve' },
  { value: 'RETURN_TO_BASE', label: 'RETURN_TO_BASE — Emergency Recharge' }
];
