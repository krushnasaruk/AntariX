import { dtnQueue } from '../../communication/queues/dtnQueue.js';
import { logEvent } from '../../events/eventLogger.js';

export function sendCommand(req, res) {
  const { commandType, params } = req.body;
  const queuedPacket = dtnQueue.enqueueUplink({ commandType, params }, (deliveredPacket) => {
    logEvent('COMMUNICATION', 'INFO', `Command ${commandType} delivered to Rover via Deep Space Link`, deliveredPacket);
  });

  logEvent('COMMUNICATION', 'INFO', `Command ${commandType} queued for transmission`, queuedPacket);

  res.json({
    success: true,
    message: 'Command queued in DTN Pipeline',
    packet: queuedPacket
  });
}

export function getCommandQueue(req, res) {
  res.json({ success: true, data: dtnQueue.getQueueState() });
}
