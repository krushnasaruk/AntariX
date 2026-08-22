/**
 * EARTH-MARS COMMUNICATION DELAY ENGINE
 * Physical constraint model based on the speed of light in vacuum.
 */

export const SPEED_OF_LIGHT_M_S = 299792458; // meters per second

export const DistanceScenario = {
  CLOSEST_APPROACH: 54600000, // ~54.6 million km
  TYPICAL_DISTANCE: 225000000, // ~225 million km
  FARTHEST_DISTANCE: 401000000 // ~401 million km
};

export const CommunicationState = {
  AVAILABLE: 'AVAILABLE',
  DELAYED: 'DELAYED',
  BLACKOUT: 'BLACKOUT',
  RESTORING: 'RESTORING'
};

export const TimeMultiplierMode = {
  REALISTIC: 1,
  DEMO: 60
};

/**
 * Validates distance input in kilometers.
 * @param {number} distanceKm 
 */
function validateDistance(distanceKm) {
  if (distanceKm === null || distanceKm === undefined || typeof distanceKm !== 'number' || Number.isNaN(distanceKm) || !Number.isFinite(distanceKm)) {
    throw new TypeError(`Invalid distance input: "${distanceKm}". Distance must be a finite number in kilometers.`);
  }
  if (distanceKm < 0) {
    throw new RangeError(`Invalid distance input: ${distanceKm} km. Distance cannot be negative.`);
  }
}

/**
 * Helper to format seconds into a human-readable duration string.
 * @param {number} totalSeconds 
 * @returns {string}
 */
function formatDuration(totalSeconds) {
  if (totalSeconds < 60) {
    return `${totalSeconds.toFixed(2)} seconds`;
  }
  const minutes = totalSeconds / 60;
  if (minutes < 60) {
    return `${minutes.toFixed(2)} minutes`;
  }
  const hours = minutes / 60;
  return `${hours.toFixed(2)} hours`;
}

/**
 * Calculates one-way communication latency in seconds for a given distance in kilometers.
 * @param {number} distanceKm 
 * @returns {number} Delay in seconds
 */
export function calculateOneWayDelay(distanceKm) {
  validateDistance(distanceKm);
  if (distanceKm === 0) return 0;

  const distanceMeters = distanceKm * 1000;
  return distanceMeters / SPEED_OF_LIGHT_M_S;
}

/**
 * Calculates round-trip communication latency in seconds for a given distance in kilometers.
 * @param {number} distanceKm 
 * @returns {number} Round-trip delay in seconds
 */
export function calculateRoundTripDelay(distanceKm) {
  const oneWay = calculateOneWayDelay(distanceKm);
  return oneWay * 2;
}

/**
 * Calculates estimated signal arrival timestamp given transmission time and distance.
 * @param {number} distanceKm 
 * @param {number} [transmissionTime=Date.now()] Epoch timestamp in milliseconds
 * @returns {number} Expected arrival epoch timestamp in milliseconds
 */
export function calculateSignalArrivalTime(distanceKm, transmissionTime = Date.now()) {
  if (typeof transmissionTime !== 'number' || Number.isNaN(transmissionTime) || !Number.isFinite(transmissionTime)) {
    throw new TypeError(`Invalid transmission time: "${transmissionTime}". Must be a valid epoch timestamp.`);
  }
  const oneWayDelaySeconds = calculateOneWayDelay(distanceKm);
  const oneWayDelayMs = oneWayDelaySeconds * 1000;
  return transmissionTime + oneWayDelayMs;
}

/**
 * Retrieves predefined Earth-Mars distance scenario value in kilometers.
 * @param {'CLOSEST_APPROACH' | 'TYPICAL_DISTANCE' | 'FARTHEST_DISTANCE'} scenario 
 * @returns {number} Distance in kilometers
 */
export function getDistanceScenario(scenario) {
  if (!scenario || typeof scenario !== 'string' || !(scenario in DistanceScenario)) {
    throw new Error(`Invalid distance scenario: "${scenario}". Available scenarios: ${Object.keys(DistanceScenario).join(', ')}.`);
  }
  return DistanceScenario[scenario];
}

/**
 * Calculates comprehensive metrics for a given distance in kilometers.
 * @param {number} distanceKm 
 * @returns {Object} Communication metrics object
 */
export function calculateCommunicationMetrics(distanceKm) {
  const oneWayDelaySeconds = calculateOneWayDelay(distanceKm);
  const roundTripDelaySeconds = calculateRoundTripDelay(distanceKm);

  return {
    distanceKm,
    distanceMeters: distanceKm * 1000,
    oneWayDelaySeconds,
    oneWayDelayMinutes: oneWayDelaySeconds / 60,
    oneWayDelayHours: oneWayDelaySeconds / 3600,
    roundTripDelaySeconds,
    roundTripDelayMinutes: roundTripDelaySeconds / 60,
    roundTripDelayHours: roundTripDelaySeconds / 3600,
    formattedOneWay: formatDuration(oneWayDelaySeconds),
    formattedRoundTrip: formatDuration(roundTripDelaySeconds),
    calculatedAt: new Date().toISOString()
  };
}

/**
 * Converts real-world elapsed time to simulated elapsed time using a time multiplier.
 * @param {number} realSeconds 
 * @param {number} [multiplier=TimeMultiplierMode.REALISTIC] 
 * @returns {number} Simulated seconds
 */
export function convertSimulatedTime(realSeconds, multiplier = TimeMultiplierMode.REALISTIC) {
  if (typeof realSeconds !== 'number' || Number.isNaN(realSeconds) || !Number.isFinite(realSeconds) || realSeconds < 0) {
    throw new TypeError(`Invalid realSeconds: "${realSeconds}". Must be a non-negative number.`);
  }
  if (typeof multiplier !== 'number' || Number.isNaN(multiplier) || !Number.isFinite(multiplier) || multiplier <= 0) {
    throw new TypeError(`Invalid time multiplier: "${multiplier}". Must be a positive number.`);
  }
  return realSeconds * multiplier;
}

/**
 * Converts simulated delay seconds into real-world waiting seconds using a time multiplier.
 * @param {number} simulatedSeconds 
 * @param {number} [multiplier=TimeMultiplierMode.REALISTIC] 
 * @returns {number} Real-world waiting seconds
 */
export function convertRealTimeWait(simulatedSeconds, multiplier = TimeMultiplierMode.REALISTIC) {
  if (typeof simulatedSeconds !== 'number' || Number.isNaN(simulatedSeconds) || !Number.isFinite(simulatedSeconds) || simulatedSeconds < 0) {
    throw new TypeError(`Invalid simulatedSeconds: "${simulatedSeconds}". Must be a non-negative number.`);
  }
  if (typeof multiplier !== 'number' || Number.isNaN(multiplier) || !Number.isFinite(multiplier) || multiplier <= 0) {
    throw new TypeError(`Invalid time multiplier: "${multiplier}". Must be a positive number.`);
  }
  return simulatedSeconds / multiplier;
}
