const Stop = require('../models/Stop.js');
const Schedule = require('../models/Schedule.js');
const { asyncHandler } = require('../middleware/errorHandler.js');

/**
 * Get all stops
 * GET /api/stops
 */
exports.getAll = asyncHandler(async (req, res) => {
  const { zone } = req.query;
  const filter = zone ? { zone } : {};
  
  const stops = await Stop.find(filter).sort({ zone: 1, name: 1 });
  
  res.json({
    success: true,
    count: stops.length,
    data: stops
  });
});

/**
 * Get single stop
 * GET /api/stops/:id
 */
exports.getOne = asyncHandler(async (req, res) => {
  const stop = await Stop.findById(req.params.id);
  
  if (!stop) {
    return res.status(404).json({
      success: false,
      error: 'Stop not found'
    });
  }
  
  res.json({
    success: true,
    data: stop
  });
});

/**
 * Create new stop
 * POST /api/stops
 */
exports.create = asyncHandler(async (req, res) => {
  const stop = await Stop.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Stop created successfully',
    data: stop
  });
});

/**
 * Update stop
 * PUT /api/stops/:id
 */
exports.update = asyncHandler(async (req, res) => {
  const stop = await Stop.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!stop) {
    return res.status(404).json({
      success: false,
      error: 'Stop not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Stop updated successfully',
    data: stop
  });
});

/**
 * Delete stop
 * DELETE /api/stops/:id
 */
exports.delete = asyncHandler(async (req, res) => {
  const stop = await Stop.findByIdAndDelete(req.params.id);
  
  if (!stop) {
    return res.status(404).json({
      success: false,
      error: 'Stop not found'
    });
  }
  
  // Delete associated schedules
  await Schedule.deleteMany({ stop: req.params.id });
  
  res.json({
    success: true,
    message: 'Stop and associated schedules deleted successfully'
  });
});
