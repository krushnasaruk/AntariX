import express from 'express';
import { ExecutiveDecisionEngine } from '../decision-engine/executive.js';

const app = express();
app.use(express.json());

const executive = new ExecutiveDecisionEngine();

app.get('/health', (req, res) => {
  res.json({ status: 'ONLINE', engine: 'On-Rover AI Executive Engine v1.0' });
});

app.post('/evaluate', (req, res) => {
  const telemetry = req.body;
  const decision = executive.evaluateCycle(telemetry);
  res.json({ success: true, decision });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🧠 [AI ENGINE RUNNING]: http://localhost:${PORT}`);
});
