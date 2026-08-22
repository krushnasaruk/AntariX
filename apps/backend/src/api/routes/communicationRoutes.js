import express from 'express';
import {
  createDTNPacket,
  PacketPriority,
  CommunicationState,
  calculateOneWayDelay
} from '../../../../../packages/communication-protocol/index.js';
import { activeSimulation } from './simulationRoutes.js';

const router = express.Router();

// GET /api/communication/status
router.get('/status', (req, res) => {
  const dist = activeSimulation.channel.distanceKm || 288000000;
  const oneWaySec = calculateOneWayDelay(dist);
  const isBlackout = activeSimulation.channel.communicationState === CommunicationState.BLACKOUT;

  res.json({
    success: true,
    source: 'Objective 1 DelayEngine + Objective 2 DTNCommunicationChannel',
    data: {
      distanceKm: dist,
      oneWayDelaySec: Math.round(oneWaySec),
      roundTripDelaySec: Math.round(oneWaySec * 2),
      speedOfLightMps: 299792458,
      state: activeSimulation.channel.communicationState,
      isBlackout,
      laserBandwidthMbps: 100,
      linkMarginDb: 14.2,
      carrierWavelengthNm: 1550,
      queuedPacketsCount: activeSimulation.channel.queue?.getQueueSize ? activeSimulation.channel.queue.getQueueSize() : 0,
      deliveredPacketsCount: 12,
      droppedPacketsCount: 0
    }
  });
});

// POST /api/communication/distance
router.post('/distance', (req, res) => {
  const { distanceKm } = req.body || {};
  if (distanceKm && Number(distanceKm) > 0) {
    activeSimulation.channel.setDistanceKm(Number(distanceKm));
  }
  const currentDist = activeSimulation.channel.distanceKm || 288000000;
  const oneWaySec = calculateOneWayDelay(currentDist);

  res.json({
    success: true,
    distanceKm: currentDist,
    oneWayDelaySec: Math.round(oneWaySec),
    roundTripDelaySec: Math.round(oneWaySec * 2)
  });
});

// GET /api/communication/queue
router.get('/queue', (req, res) => {
  const rawPackets = activeSimulation.channel.queue?.getQueuedPackets ? activeSimulation.channel.queue.getQueuedPackets() : [];
  res.json({
    success: true,
    data: {
      uplink: rawPackets.map(p => ({
        id: p.id,
        commandType: p.payload?.commandType || 'MOVE_ROVER',
        priority: p.priorityName || 'NORMAL',
        status: p.status || 'QUEUED',
        timestamp: p.createdAt || Date.now(),
        payload: p.payload
      })),
      downlink: []
    }
  });
});

// POST /api/communication/send
router.post('/send', (req, res) => {
  const { commandType, params, priority } = req.body || {};
  const isBlackout = activeSimulation.channel.communicationState === CommunicationState.BLACKOUT;

  const packet = createDTNPacket({
    priority: priority === 'CRITICAL' ? PacketPriority.CRITICAL : PacketPriority.NORMAL,
    payload: { commandType: commandType || 'MOVE_TO', params: params || {} }
  });

  const transmittedPacket = activeSimulation.channel.sendPacket(packet);

  res.json({
    success: true,
    source: 'DTNCommunicationChannel (Obj 2)',
    packet: {
      id: transmittedPacket.id,
      priority: transmittedPacket.priorityName || 'NORMAL',
      numericPriority: transmittedPacket.priority,
      status: isBlackout ? 'BUFFERED_DURING_BLACKOUT' : (transmittedPacket.status || 'IN_TRANSIT'),
      timestamp: transmittedPacket.createdAt || Date.now()
    }
  });
});

// POST /api/communication/blackout
router.post('/blackout', (req, res) => {
  const { active } = req.body || {};
  if (active) {
    activeSimulation.injectFault('BLACKOUT');
  } else {
    activeSimulation.clearFault('BLACKOUT');
  }

  res.json({
    success: true,
    blackoutActive: activeSimulation.channel.communicationState === CommunicationState.BLACKOUT
  });
});

export default router;
