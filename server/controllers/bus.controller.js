const Bus = require('../models/Bus.js');
const Schedule = require('../models/Schedule.js');
const { asyncHandler } = require('../middleware/errorHandler.js');

// Get all buses [GET /api/buses]
exports.getAll = asyncHandler(async (req, res) => {
  const { status, linkedUser } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (linkedUser) filter.linkedUser = linkedUser;
  
  const buses = await Bus.find(filter)
    .populate('linkedUser', 'name rollNo')
    .sort({ busNumber: 1 })
    .lean();
  
  res.json({
    success: true,
    count: buses.length,
    data: buses
  });
});

//Get single bus | GET /api/buses/:id
exports.getOne = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id)
    .populate('linkedUser', 'name rollNo')
    .lean();
  
  if (!bus) {
    return res.status(404).json({
      success: false,
      error: 'Bus not found'
    });
  }
  
  res.json({
    success: true,
    data: bus
  });
});

// Create new bus [POST /api/buses]
exports.create = asyncHandler(async (req, res) => {
  const bus = await Bus.create(req.body);
  
  res.status(201).json({
    success: true,
    message: 'Bus created successfully',
    data: bus
  });
});

// Update bus [PUT /api/buses/:id]
exports.update = asyncHandler(async (req, res) => {
  const bus = await Bus.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  );
  
  if (!bus) {
    return res.status(404).json({
      success: false,
      error: 'Bus not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Bus updated successfully',
    data: bus
  });
});

// Delete bus [DELETE /api/buses/:id]
exports.delete = asyncHandler(async (req, res) => {
  const bus = await Bus.findByIdAndDelete(req.params.id);
  
  if (!bus) {
    return res.status(404).json({
      success: false,
      error: 'Bus not found'
    });
  }
  
  // Delete associated schedules
  await Schedule.deleteMany({ bus: req.params.id });
  
  res.json({
    success: true,
    message: 'Bus and associated schedules deleted successfully'
  });
});

// Get bus schedules [GET /api/buses/:id/schedules]
exports.getSchedules = asyncHandler(async (req, res) => {
  const bus = await Bus.findById(req.params.id);
  if (!bus) {
    return res.status(404).json({
      success: false,
      error: 'Bus not found'
    });
  }
  
  const schedules = await Schedule.find({ bus: req.params.id })
    .populate('stop')
    .sort({ date: 1, departureTime: 1 })
    .lean();
  
  res.json({
    success: true,
    count: schedules.length,
    data: schedules
  });
});
