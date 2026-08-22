/**
 * EARTH GUIDANCE REQUEST PROTOCOL & DEADLOCK-FREE FALLBACK HANDLER
 */

import { ActionType } from './autonomy-types.js';

export const GuidanceStatus = {
  PENDING: 'PENDING',
  DELIVERED_TO_EARTH: 'DELIVERED_TO_EARTH',
  RESPONSE_RECEIVED: 'RESPONSE_RECEIVED',
  TIMED_OUT: 'TIMED_OUT',
  RESOLVED_LOCALLY: 'RESOLVED_LOCALLY'
};

export class EarthGuidanceManager {
  constructor(options = {}) {
    this.timeoutSeconds = options.timeoutSeconds || 3600; // 1 hour max wait before fallback
    this.requests = new Map();
  }

  /**
   * Creates a formal Earth guidance request when local autonomy cannot resolve an anomaly.
   * @param {Object} params
   * @returns {Object} GuidanceRequest object
   */
  requestGuidance(params = {}) {
    const requestId = params.guidanceRequestId || `GUIDE-REQ-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const now = params.currentTimeMs || Date.now();
    const deadline = params.decisionDeadline || (now + (this.timeoutSeconds * 1000));

    const request = {
      guidanceRequestId: requestId,
      missionId: params.missionId || 'MARS_EXPEDITION_01',
      requestedDecision: params.requestedDecision || 'AUTONOMOUS_RECOVERY_PROPOSAL',
      reason: params.reason || 'UNRESOLVABLE_LOCAL_ANOMALY',
      confidence: params.confidence !== undefined ? params.confidence : 0.40,
      createdAt: now,
      decisionDeadline: deadline,
      fallbackAction: params.fallbackAction || {
        action: ActionType.WAIT,
        payload: { reason: 'EARTH_GUIDANCE_TIMEOUT_FALLBACK' }
      },
      status: GuidanceStatus.PENDING,
      response: null
    };

    this.requests.set(requestId, request);
    return request;
  }

  /**
   * Checks status of a guidance request against current simulation time.
   * If deadline exceeded, triggers deterministic safety-authorized fallback action.
   * @param {string} requestId 
   * @param {number} currentTimeMs 
   * @returns {Object} Resolution result
   */
  evaluateRequest(requestId, currentTimeMs = Date.now()) {
    const request = this.requests.get(requestId);
    if (!request) {
      return {
        resolved: true,
        action: { action: ActionType.WAIT, payload: { reason: 'UNKNOWN_GUIDANCE_REQUEST' } }
      };
    }

    if (request.response) {
      return {
        resolved: true,
        status: GuidanceStatus.RESPONSE_RECEIVED,
        action: request.response,
        fromEarth: true
      };
    }

    if (currentTimeMs >= request.decisionDeadline) {
      request.status = GuidanceStatus.TIMED_OUT;
      return {
        resolved: true,
        status: GuidanceStatus.TIMED_OUT,
        action: request.fallbackAction,
        fallbackTriggered: true
      };
    }

    return {
      resolved: false,
      status: GuidanceStatus.PENDING,
      remainingTimeMs: request.decisionDeadline - currentTimeMs
    };
  }

  /**
   * Receives Earth command in response to a guidance request.
   */
  receiveEarthResponse(requestId, actionDecision) {
    const request = this.requests.get(requestId);
    if (request) {
      request.response = actionDecision;
      request.status = GuidanceStatus.RESPONSE_RECEIVED;
      return true;
    }
    return false;
  }
}
