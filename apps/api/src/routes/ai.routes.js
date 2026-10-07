import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { chat, insights } from '../controllers/ai.controller.js';

const router = Router();

router.post('/chat', requireAuth, chat);
router.get('/insights', requireAuth, insights);

export default router;
