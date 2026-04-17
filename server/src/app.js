require('dotenv').config();
require('./firebase'); // Initialize Firebase Admin before anything else

const express = require('express');
const cors = require('cors');

const app = express();

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ──────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'StudyPro Backend',
    version: '1.0.0',
  });
});

// ─── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/goals', require('./routes/goals.routes'));
app.use('/api/sessions', require('./routes/sessions.routes'));
app.use('/api/progress', require('./routes/progress.routes'));
app.use('/api/notifications', require('./routes/notifications.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/profile', require('./routes/profile.routes'));
app.use('/api/practice', require('./routes/practice.routes'));

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;
