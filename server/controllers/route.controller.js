const { asyncHandler } = require('../middleware/errorHandler.js');
const routeService = require('../services/routeService.js');
const reservationService = require('../services/reservationService.js');
const { formatTime } = require('../utils/timeHelpers');

// Find bus for route [GET /api/route/find?stopId=xxx&time=HH:MM]
exports.findBus = asyncHandler(async (req, res) => {
  const { stopId, time } = req.query;
  
  if (!stopId || !time) {
    return res.status(400).json({
      success: false,
      error: 'stopId and time query parameters required'
    });
  }
  
  const result = await routeService.findBusAllocation(stopId, time);
  
  const bus = result.schedule.bus;
  const departureMessage = result.isToday 
    ? 'Departing today at' 
    : 'Next available departure at';
  
  res.json({
    success: true,
    stop: result.stop,
    route: result.route,
    scheduleId: result.schedule._id,
    busDetails: {
      routeName: result.schedule.routeName,
      plateNumber: bus.busNumber,
      model: bus.model,
      driverName: bus.driverName,
      capacity: bus.capacity,
      bookedSeats: result.schedule.seatsBooked,
      availableSeats: bus.capacity - result.schedule.seatsBooked,
      departureTime: formatTime(result.schedule.departureTime),
      departureMessage,
      isToday: result.isToday,
      distanceKm: result.distance_km,
      travelTimeMin: result.travel_time_min
    }
  });
});

// Reserve seat [POST /api/route/reserve]
exports.reserve = asyncHandler(async (req, res) => {
  const { scheduleId, seatNumber } = req.body;
  const userId = req.userId || req.body.userId; // Fallback for legacy clients
  
  if (!scheduleId || !seatNumber) {
    return res.status(400).json({
      success: false,
      error: 'scheduleId and seatNumber are required'
    });
  }
  
  const result = await reservationService.reserveSeat(
    userId, 
    scheduleId, 
    seatNumber
  );
  
  res.json({
    success: true,
    message: `Seat ${seatNumber} reserved successfully`,
    data: {
      seatNumber: result.seatNumber,
      schedule: result.schedule
    }
  });
});

// Cancel reservation [POST /api/route/cancel]
exports.cancel = asyncHandler(async (req, res) => {
  const { scheduleId, seatNumber } = req.body;
  const userId = req.userId || req.body.userId;
  
  await reservationService.cancelReservation(
    userId, 
    scheduleId, 
    seatNumber
  );
  
  res.json({
    success: true,
    message: 'Reservation cancelled successfully'
  });
});

// Get user reservations [GET /api/route/reservations]
exports.getMyReservations = asyncHandler(async (req, res) => {
  const reservations = await reservationService.getUserReservations(req.userId);
  
  res.json({
    success: true,
    count: reservations.length,
    data: reservations,
    reservedSeats: reservations
  });
});
