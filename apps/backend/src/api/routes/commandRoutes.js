import express from 'express';
import { sendCommand, getCommandQueue } from '../controllers/commandController.js';
import { validateCommandPayload } from '../validators/commandValidator.js';

const router = express.Router();
router.post('/send', validateCommandPayload, sendCommand);
router.get('/queue', getCommandQueue);

export default router;
