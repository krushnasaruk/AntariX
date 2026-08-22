import React from 'react';
import { StatusBadge } from '../ui/StatusBadge';
import { Radio, Clock } from 'lucide-react';

const PRIORITY_STYLES = {
  CRITICAL: 'danger',
  HIGH: 'warning',
  NORMAL: 'info',
  LOW: 'neutral'
};

const DEFAULT_PACKETS = [
  {
    id: 'PKT-178739-001',
    commandType: 'MOVE_ROVER',
    priority: 'NORMAL',
    status: 'BUFFERED_DURING_BLACKOUT',
    delayMs: 751000,
    ttl: '86400s'
  },
  {
    id: 'PKT-178739-002',
    commandType: 'COLLECT_SAMPLE',
    priority: 'HIGH',
    status: 'IN_TRANSIT',
    delayMs: 751000,
    ttl: '86400s'
  }
];

export function PacketQueueTable({ queue, packets }) {
  const items = packets || queue || [];
  const displayItems = items.length > 0 ? items : DEFAULT_PACKETS;

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="hud-table" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>Packet ID</th>
            <th>Command</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Latency (One-Way)</th>
            <th>TTL Remaining</th>
          </tr>
        </thead>
        <tbody>
          {displayItems.map((pkt, idx) => {
            const cmd = pkt.commandType || pkt.command?.commandType || (typeof pkt.command === 'string' ? pkt.command : 'MOVE_ROVER');
            const isCritical = pkt.priority === 'CRITICAL';
            const isBuffered = pkt.status === 'BUFFERED_DURING_BLACKOUT' || pkt.status === 'BLOCKED';

            return (
              <tr key={pkt.id || idx}>
                <td style={{ fontWeight: 700, color: '#ffffff', fontFamily: 'var(--font-mono)' }}>
                  {pkt.id}
                </td>
                <td style={{ color: '#38bdf8', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>
                  {cmd}
                </td>
                <td>
                  <StatusBadge variant={PRIORITY_STYLES[pkt.priority] || 'info'} pulse={isCritical}>
                    {pkt.priority || 'NORMAL'}
                  </StatusBadge>
                </td>
                <td>
                  <StatusBadge variant={pkt.status === 'DELIVERED' ? 'success' : isBuffered ? 'warning' : 'info'}>
                    {pkt.status || 'QUEUED'}
                  </StatusBadge>
                </td>
                <td style={{ fontFamily: 'var(--font-mono)', color: '#94a3b8' }}>
                  {pkt.delayMs ? `${Math.round(pkt.delayMs / 1000)}s` : '12m 31s (751s)'}
                </td>
                <td style={{ color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                  {pkt.ttl || '86,400s'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
