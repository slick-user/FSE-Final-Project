const Schedule = require('../models/Schedule');
const Bus = require('../models/Bus.js');
const Stop = require('../models/Stop.js');
const { asyncHandler } = require('../middleware/errorHandler.js');
const { getTodayStart } = require('../utils/timeHelpers.js');

// Get all schedules [GET /api/schedules]
exports.getAll = asyncHandler(async (req, res) => {
  const { date, status, busId, stopId } = req.query;
  
  const filter = {};
  if (date) filter.date = new Date(date);
  if (status) filter.status = status;
  if (busId) filter.bus = busId;
  if (stopId) filter.stop = stopId;
  
  const schedules = await Schedule.find(filter)
    .populate('bus')
    .populate('stop')
    .sort({ date: 1, departureTime: 1 });
  
  res.json({
    success: true,
    count: schedules.length,
    data: schedules
  });
});

// Get single schedule [GET /api/schedules/:id]
exports.getOne = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findById(req.params.id)
    .populate('bus')
    .populate('stop');
  
  if (!schedule) {
    return res.status(404).json({
      success: false,
      error: 'Schedule not found'
    });
  }
  
  res.json({
    success: true,
    data: schedule
  });
});

// Create new schedule (assign bus) [POST /api/schedules]
exports.create = asyncHandler(async (req, res) => {
  const { busId, stopId, date, departureTime, routeName, recurringDaily } = req.body;
  
  // Validate bus and stop exist
  const [bus, stop] = await Promise.all([
    Bus.findById(busId),
    Stop.findById(stopId)
  ]);
  
  if (!bus) {
    return res.status(404).json({
      success: false,
      error: 'Bus not found'
    });
  }
  
  if (!stop) {
    return res.status(404).json({
      success: false,
      error: 'Stop not found'
    });
  }
  
  // Check for conflicts (same bus, date, time)
  const conflict = await Schedule.findOne({
    bus: busId,
    date: new Date(date),
    departureTime
  });
  
  if (conflict) {
    return res.status(409).json({
      success: false,
      error: 'Bus is already scheduled at this time'
    });
  }
  
  // Create schedule
  const schedule = await Schedule.create({
    bus: busId,
    stop: stopId,
    date: new Date(date),
    departureTime,
    routeName: routeName || `${stop.zone} - ${stop.name}`,
    recurringDaily: !!recurringDaily
  });
  
  await schedule.populate(['bus', 'stop']);
  
  res.status(201).json({
    success: true,
    message: 'Schedule created successfully',
    data: schedule
  });
});

// Update schedule [PUT /api/schedules/:id] 
exports.update = asyncHandler(async (req, res) => {
  const { status } = req.body;

  const existing = await Schedule.findById(req.params.id).populate(['bus', 'stop']);
  if (!existing) {
    return res.status(404).json({
      success: false,
      error: 'Schedule not found'
    });
  }

  if (status === 'completed') {
    const scheduledAt = new Date(existing.date);
    const parts = (existing.departureTime || '00:00').split(':');
    scheduledAt.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0);
    if (new Date() < scheduledAt) {
      return res.status(400).json({
        success: false,
        error: 'Cannot complete a schedule before its departure time'
      });
    }
  }

  const schedule = await Schedule.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate(['bus', 'stop']);
 
  res.json({
    success: true,
    message: 'Schedule updated successfully',
    data: schedule
  });
});

// Delete schedule [DELETE /api/schedules/:id]
exports.delete = asyncHandler(async (req, res) => {
  const schedule = await Schedule.findByIdAndDelete(req.params.id);
  
  if (!schedule) {
    return res.status(404).json({
      success: false,
      error: 'Schedule not found'
    });
  }
  
  res.json({
    success: true,
    message: 'Schedule deleted successfully'
  });
});