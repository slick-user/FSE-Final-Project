const User = require('../models/User.js');
const Schedule = require('../models/Schedule.js');
const Bus = require('../models/Bus.js');
const { asyncHandler } = require('../middleware/errorHandler.js');


exports.updateAvailability = asyncHandler(async (req, res) => {
    const { available } = req.body;

    // req.userId should be set by authenticate middleware
    const user = await User.findById(req.userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    if (user.role !== 'driver') {
        return res.status(403).json({
            success: false,
            error: 'Only drivers can update availability'
        });
    }

    // Update driver profile
    if (!user.driverProfile) {
        user.driverProfile = {};
    }

    user.driverProfile.available = available;
    await user.save();

    res.json({
        success: true,
        message: 'Availability updated successfully',
        available: user.driverProfile.available
    });
});

// Get driver's assigned routes [GET /api/drivers/routes]
exports.getMyRoutes = asyncHandler(async (req, res) => {
    const user = await User.findById(req.userId);

    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found'
        });
    }

    if (user.role !== 'driver') {
        return res.status(403).json({
            success: false,
            error: 'Only drivers can access this endpoint'
        });
    }

    // Get effective bus
    let assignedBusId = user.driverProfile?.assignedBus;
    if (!assignedBusId) {
        const linked = await Bus.findOne({ linkedUser: user._id });
        assignedBusId = linked ? linked._id : null;
    }

    if (!assignedBusId) {
        return res.json({
            success: true,
            message: 'No bus assigned',
            data: []
        });
    }

    const schedules = await Schedule.find({ bus: assignedBusId })
        .populate('bus')
        .populate('stop')
        .sort({ date: 1, departureTime: 1 });

    res.json({
        success: true,
        count: schedules.length,
        data: schedules
    });
});

// Update route status [PUT /api/drivers/routes/:id/status]
exports.updateRouteStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;
    const scheduleId = req.params.id;

    // Validate status
    const validStatuses = ['scheduled', 'running', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({
            success: false,
            error: 'Invalid status. Must be one of: ' + validStatuses.join(', ')
        });
    }

    // Get user
    const user = await User.findById(req.userId);

    if (!user || user.role !== 'driver') {
        return res.status(403).json({
            success: false,
            error: 'Only drivers can update route status'
        });
    }

    // Get schedule
    const schedule = await Schedule.findById(scheduleId)
        .populate('bus')
        .populate('stop');

    if (!schedule) {
        return res.status(404).json({
            success: false,
            error: 'Schedule not found'
        });
    }

    // Verify this schedule belongs to driver's bus (fallback to linked bus)
    let assignedBusId = user.driverProfile?.assignedBus;
    if (!assignedBusId) {
        const linked = await Bus.findOne({ linkedUser: user._id });
        assignedBusId = linked ? linked._id : null;
    }
    if (!assignedBusId || schedule.bus._id.toString() !== assignedBusId.toString()) {
        return res.status(403).json({
            success: false,
            error: 'You can only update routes for your assigned bus'
        });
    }

    const scheduledAt = new Date(schedule.date);
    const parts = (schedule.departureTime || '00:00').split(':');
    scheduledAt.setHours(parseInt(parts[0], 10) || 0, parseInt(parts[1], 10) || 0, 0, 0);
    if (status === 'completed' && new Date() < scheduledAt) {
        return res.status(400).json({
            success: false,
            error: 'Cannot complete a schedule before its departure time'
        });
    }

    schedule.status = status;
    await schedule.save();

    res.json({
        success: true,
        message: 'Route status updated successfully',
        data: schedule
    });
});
