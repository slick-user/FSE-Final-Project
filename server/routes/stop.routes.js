const express = require('express');
const stopController = require('../controllers/stop.controller');
const { authenticate, authorize } = require('../middleware/auth');
const { validate, stopRules, mongoIdParam } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.get('/', stopController.getAll);
router.get('/:id', mongoIdParam(), validate, stopController.getOne);

// Protected admin routes
router.use(authenticate, authorize('admin'));

router.post('/', stopRules, validate, stopController.create);
router.put('/:id', mongoIdParam(), stopRules, validate, stopController.update);
router.delete('/:id', mongoIdParam(), validate, stopController.delete);

module.exports = router;