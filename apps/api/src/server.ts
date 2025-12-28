import express from 'express';
import cors from 'cors';
import { requestLogger } from './middleware/request-logger';
import { errorHandler } from './middleware/error-handler';
import huntsRouter from './routes/hunts';
import postItsRouter from './routes/post-its';
import submissionsRouter from './routes/submissions';
import stateRouter from './routes/state';
import uploadsRouter from './routes/uploads';
import exportRouter from './routes/export';
import * as huntService from './services/hunt-service';
import { createHuntSchema } from './lib/validation';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(requestLogger);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Scaven Hunt API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      hunts: '/api/hunts',
      postIts: '/api/post-its',
      submissions: '/api/submissions',
      state: '/api/state',
      uploads: '/api/uploads',
      export: '/api/export',
    },
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

// Routes
// Handle POST /api/hunts directly (before mounting router to avoid trailing slash issues)
app.post('/api/hunts', async (req, res, next) => {
  try {
    const data = createHuntSchema.parse(req.body);
    const hunt = await huntService.createHunt(data);
    res.json({
      huntId: hunt.id,
      code: hunt.code,
      shareSlug: hunt.shareSlug,
      status: hunt.status,
    });
  } catch (err) {
    next(err);
  }
});
app.use('/api/hunts', huntsRouter);
app.use('/api', postItsRouter);
app.use('/api', submissionsRouter);
app.use('/api', stateRouter);
app.use('/api', uploadsRouter);
app.use('/api', exportRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 API server running on http://localhost:${PORT}`);
});

