const express = require('express');
const driverController = require('../controllers/driver.controller.js');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// All driver routes require authentication
router.use(authenticate);

// Update driver availability status PUT /api/drivers/availability
router.put('/availability', driverController.updateAvailability);

// Get driver's assigned routes GET /api/drivers/routes
router.get('/routes', driverController.getMyRoutes);

// Update route status PUT /api/drivers/routes/:id/status
router.put('/routes/:id/status', driverController.updateRouteStatus);

module.exports = router;
