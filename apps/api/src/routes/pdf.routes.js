import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { quotePdf, invoicePdf } from '../controllers/pdf.controller.js';

const router = Router();

router.get('/quotes/:id', requireAuth, quotePdf);
router.get('/invoices/:id', requireAuth, invoicePdf);

export default router;
