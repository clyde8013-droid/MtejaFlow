import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import aiRoutes from './routes/ai.routes.js';
import pdfRoutes from './routes/pdf.routes.js';
import messagesRoutes from './routes/messages.routes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 4000;
const WEB_ORIGIN = process.env.WEB_ORIGIN || 'http://localhost:5173';

app.use(cors({ origin: WEB_ORIGIN }));
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/ai', aiRoutes);
app.use('/api/pdf', pdfRoutes);
app.use('/api/messages', messagesRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`MtejaFlow API listening on http://localhost:${PORT}`);
});
