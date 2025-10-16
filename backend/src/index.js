/**
 * Entry point for the Express backend.
 * Sets up middleware, routes, and connects to MongoDB.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { randomUUID } = require('crypto');
const rateLimit = require('express-rate-limit');
const pino = require('pino');

// Create structured logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: true
    }
  }
});

const planRoutes = require('./routes/planRoutes');
const contentRoutes = require('./routes/contentRoutes');
const path = require('path');

const app = express();

// Request ID middleware
app.use((req, res, next) => {
  req.requestId = req.get('X-Request-Id') || randomUUID();
  res.set('X-Request-Id', req.requestId);
  req.logger = logger.child({ requestId: req.requestId });
  req.logger.info({ method: req.method, url: req.url }, 'Request started');
  next();
});

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX || 30, // limit each IP to 30 requests per windowMs
  message: { status: 'error', message: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(cors());
app.use(express.json());

// Apply rate limiting to AI endpoints
app.use('/api/generate-plan', aiRateLimit);

app.use('/api', planRoutes);
app.use('/api', contentRoutes);

// Serve frontend static build if present. FRONTEND_BUILD_DIR can be set in env
const FRONTEND_BUILD_DIR = process.env.FRONTEND_BUILD_DIR || path.join(__dirname, '..', '..', 'frontend', 'dist');
try {
  app.use(express.static(FRONTEND_BUILD_DIR));
  // Fallback to index.html for client-side routing
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) return next();
    res.sendFile(path.join(FRONTEND_BUILD_DIR, 'index.html'), (err) => {
      if (err) next();
    });
  });
} catch (e) {
  // ignore if frontend build not present
  logger.info('No frontend build found to serve statically');
}

// Health check endpoint
app.get('/health', (req, res) => {
  req.logger.info('Health check requested');
  res.json({ status: 'ok', message: 'Server is running', requestId: req.requestId });
});

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/goalplanner';
    await mongoose.connect(mongoUri, { useNewUrlParser: true, useUnifiedTopology: true });
    logger.info('Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => logger.info(`Server running on port ${PORT}`));
  } catch (err) {
    logger.error({ error: err }, 'Failed to start server');
    process.exit(1);
  }
}

start();
