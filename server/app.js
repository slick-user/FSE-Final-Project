const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/env');
const { connectDB } = require('./config/db');
const routes = require('./routes');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(cors({
  origin: config.nodeEnv === 'production'
    ? process.env.ALLOWED_ORIGINS?.split(',')
    : '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (dev only)
if (config.nodeEnv === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Routes (MUST come before static files to prevent shadowing)
app.use(routes);

// Static files
app.use(express.static(path.join(__dirname, '../client')));
app.use('/static', express.static(path.join(__dirname, '../client/static')));

// Error handlers (must be last)
app.use(notFound);
app.use(errorHandler);

// Database connection
if (config.nodeEnv !== 'test') {
  connectDB();
}

module.exports = app;