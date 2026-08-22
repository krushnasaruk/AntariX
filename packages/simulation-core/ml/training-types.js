/**
 * Objective 12 Training Engine Type Definitions
 */

/**
 * @typedef {Object} TrainingJob
 * @property {string} jobId
 * @property {string} experimentId
 * @property {string} modelType
 * @property {string} algorithm
 * @property {string} datasetVersion
 * @property {string} environmentVersion
 * @property {number} seed
 * @property {string} device
 * @property {string} status
 * @property {number} epochs
 */

/**
 * @typedef {Object} WorkerCapabilities
 * @property {string} device
 * @property {boolean} cudaAvailable
 * @property {string} gpuName
 * @property {number} vramGB
 */
