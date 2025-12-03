const express = require('express');
const busController = require('../controllers/bus.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, busRules, mongoIdParam } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', busController.getAll);
router.get('/:id', mongoIdParam(), validate, busController.getOne);
router.get('/:id/schedules', mongoIdParam(), validate, busController.getSchedules);

// Protected admin routes
router.use(authenticate, authorize('admin'));

router.post('/', busRules, validate, busController.create);
router.put('/:id', mongoIdParam(), busRules, validate, busController.update);
router.delete('/:id', mongoIdParam(), validate, busController.delete);

module.exports = router;