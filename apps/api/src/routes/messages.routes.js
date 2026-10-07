import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { generateMessage } from '../controllers/messages.controller.js';

const router = Router();

router.post('/generate', requireAuth, generateMessage);

export default router;
