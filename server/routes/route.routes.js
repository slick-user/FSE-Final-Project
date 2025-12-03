const express = require('express');
const routeController = require('../controllers/route.controller');
const { authenticate } = require('../middleware/auth');
const { validate, reservationRules } = require('../middleware/validation');

const router = express.Router();

// Public route finding
router.get('/find', routeController.findBus);
router.get('/', routeController.findBus);

// Protected reservation routes
router.use(authenticate);

router.post('/reserve', reservationRules, validate, routeController.reserve);
router.post('/cancel', reservationRules, validate, routeController.cancel);
router.get('/reservations', routeController.getMyReservations);

module.exports = router;