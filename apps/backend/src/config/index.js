export const config = {
  port: process.env.PORT || 3000,
  commMode: process.env.COMMUNICATION_MODE || 'demo',
  latencySeconds: parseInt(process.env.COMMUNICATION_LATENCY_SECONDS || '5', 10),
  packetLossRate: parseFloat(process.env.PACKET_LOSS_RATE || '0.02'),
  blackoutEnabled: process.env.BLACKOUT_SIMULATION_ENABLED === 'true'
};

