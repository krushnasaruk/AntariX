import { LatencySimulator } from '../src/communication/latency/latencySimulator.js';

console.log('🧪 Running Backend Latency Test Suite...');
const sim = new LatencySimulator();
sim.setLatency(10);

if (sim.getDelayMs() === 10000) {
  console.log('✅ Latency conversion test passed: 10s -> 10000ms');
} else {
  console.error('❌ Latency conversion test failed');
  process.exit(1);
}
