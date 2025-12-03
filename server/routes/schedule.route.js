const express = require('express');
const scheduleController = require('../controllers/schedule.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, scheduleRules, mongoIdParam } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', scheduleController.getAll);
router.get('/:id', mongoIdParam(), validate, scheduleController.getOne);

// Protected admin routes
router.use(authenticate, authorize('admin'));

router.post('/', scheduleRules, validate, scheduleController.create);
router.put('/:id', mongoIdParam(), validate, scheduleController.update);
router.delete('/:id', mongoIdParam(), validate, scheduleController.delete);

module.exports = router;