const express = require('express');
const path = require('path');

const authRoutes = require('./auth.routes');
const busRoutes = require('./bus.routes');
const stopRoutes = require('./stop.routes');
const scheduleRoutes = require('./schedule.route');
const routeRoutes = require('./route.routes');
const driverRoutes = require('./driver.routes');

const authController = require('../controllers/auth.controller.js');
const upload = require('../middleware/upload');
const { validate, registerRules, loginRules, forgotPasswordRules, resetPasswordRules } = require('../middleware/validation');

const router = express.Router();

// API routes
router.use('/api/auth', authRoutes);
router.use('/api/buses', busRoutes);
router.use('/api/stops', stopRoutes);
router.use('/api/schedules', scheduleRoutes);
router.use('/api/route', routeRoutes);
router.use('/api/drivers', driverRoutes);

// Legacy auth aliases for clients still using /api/*
router.post('/api/register', upload.single('profilePhoto'), registerRules, validate, authController.register);
router.post('/api/login', loginRules, validate, authController.login);
router.post('/api/forgot-password', forgotPasswordRules, validate, authController.forgotPassword);
router.post('/api/reset-password', resetPasswordRules, validate, authController.resetPassword);

// Simple health check to verify router is mounted
router.get('/api/auth/health', (req, res) => res.json({ ok: true }));

// Frontend page routes
const clientPath = path.join(__dirname, '../../client');

router.get('/', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

router.get('/allocator.html', (req, res) => {
  res.sendFile(path.join(clientPath, 'allocator.html'));
});

router.get('/team.html', (req, res) => {
  res.sendFile(path.join(clientPath, 'team.html'));
});

router.get('/admin.html', (req, res) => {
  res.sendFile(path.join(clientPath, 'admin.html'));
});

router.get('/login.html', (req, res) => {
  res.sendFile(path.join(clientPath, 'login.html'));
});

module.exports = router;