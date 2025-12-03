const express = require('express');

const { User } = require('../config/db.js');
const Stop = require('../config/stop.js');
const Bus = require('../config/bus.js');
const Schedule = require('../config/schedule.js');
const { getRouteBetween } = require('../controllers/ors.js');

const router = express.Router();

// FAST UNIVERSITY COORDS
const FAST_COORDS = { lat: 33.6405, lng: 73.0372 };

// Helper Functions 
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

//Format time in 12-hour format
function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function selectBestSchedule(schedules, requestedTimeMinutes) {
  let bestSchedule = null;
  let smallestFutureDiff = Infinity;
  let bestPastSchedule = null;
  let largestPastDiff = -Infinity;
  let isToday = false;

  for (const schedule of schedules) {
    const departureMinutes = timeToMinutes(schedule.departureTime);
    const diff = departureMinutes - requestedTimeMinutes;

    if (diff >= 0) {
      // future bus
      if (diff < smallestFutureDiff) {
        bestSchedule = schedule;
        smallestFutureDiff = diff;
        isToday = true;
      }
    } else {
      // past bus
      if (diff > largestPastDiff) {
        bestPastSchedule = schedule;
        largestPastDiff = diff;
      }
    }
  }

  if (!bestSchedule) {
    bestSchedule = bestPastSchedule;
    isToday = false;
  }

  return { bestSchedule, isToday };
}

// GET /api/route?stopId=...&time=...
router.get('/', async (req, res) => {
  const { stopId, time } = req.query;
  if (!stopId || !time) return res.status(400).json({ error: 'stopId and time query params required' });

  try {
    // temp (remove this log later)
    console.log("Requested stopId:", stopId);
    const stop = await Stop.findById(stopId);
    if (!stop) return res.status(404).json({ error: 'Stop not found' });

    // Get today's date (YYYY-MM-DD)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find all schedules for this stop today (or any date for now)
    const schedules = await Schedule.find({
      stop: stopId,
      status: 'scheduled'
    }).populate('bus');

    if (schedules.length === 0) {
      return res.json({
        error: true,
        message: 'No buses scheduled for this stop today. Please try another stop or check back tomorrow.'
      });
    }

    // Find the best matching schedule
    const requestedMinutes = timeToMinutes(time);
    const { bestSchedule: selectedSchedule, isToday: scheduleIsToday } = selectBestSchedule(schedules, requestedMinutes);

    // If no match found, suggest earliest next day bus
    let bestSchedule = selectedSchedule;
    let isToday = scheduleIsToday;

    if (!bestSchedule) {
      bestSchedule = schedules[0]; // Fallback to first schedule
      isToday = false;
    }

    // Calculate route using ORS
    const start = FAST_COORDS;
    const end = { lat: stop.location.coordinates[1], lng: stop.location.coordinates[0] };
    const routeGeoJSON = await getRouteBetween(start, end);

    const feature = routeGeoJSON.features && routeGeoJSON.features[0];
    const summary = feature?.properties?.summary || {};
    const distance_m = summary.distance || 0;
    const duration_s = summary.duration || 0;

    const distance_km = (distance_m / 1000).toFixed(1);
    const travel_time_min = Math.round(duration_s / 60);

    // Build response for frontend banner
    const bus = bestSchedule.bus;
    const departureMessage = isToday 
      ? 'Departing today at' 
      : 'Next available departure at';

    res.json({
      stop,
      route: routeGeoJSON,
      _id: bestSchedule._id,
      bus_details: {
        route_name: bestSchedule.routeName,
        plate_number: bus.busNumber,
        model: bus.model,
        driver_name: bus.driverName,
        capacity: bus.capacity,
        departure_time: formatTime(bestSchedule.departureTime),
        departure_message: departureMessage,
        is_today: isToday,
        distance_km,
        travel_time_min
      }
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(502).json({ error: 'Routing failed', details: err?.message || err });
  }
});

// SEAT RESERVATIONS
router.post('/reserve', async (req, res) => {
  const { userId, scheduleId, seatNumber } = req.body;
  if (!userId || !scheduleId || seatNumber == null)
    return res.status(400).json({ error: 'Missing parameters' });

  try {
    const user = await User.findById(userId);
    const schedule = await Schedule.findById(scheduleId).populate('bus');
    if (!user || !schedule)
      return res.status(404).json({ error: 'User or schedule not found' });

    // Is this seat already taken by anyone?
    let alreadyReserved = false;
    for (let u of await User.find({ "reservedSeats.schedule": scheduleId, "reservedSeats.seatNumber": seatNumber })) {
      alreadyReserved = true;
      break;
    }
    if (alreadyReserved)
      return res.status(409).json({ error: 'Seat already reserved' });

    // Are there enough seats on the bus?
    if (schedule.seatsBooked >= schedule.bus.capacity)
      return res.status(409).json({ error: 'Bus is full' });

    // All good - update both user and schedule
    schedule.seatsBooked += 1;
    await schedule.save();

    user.reservedSeats.push({ schedule: scheduleId, seatNumber });
    await user.save();

    res.json({
      success: true,
      message: 'Seat reserved',
      reservedSeats: user.reservedSeats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel reservation (keep field names consistent)
router.post('/reservations/cancel', async (req, res) => {
  const { userId, scheduleId, seatNumber } = req.body;
  if (!userId || !scheduleId || seatNumber == null)
    return res.status(400).json({ error: 'Missing parameters' });

  try {
    const user = await User.findById(userId);
    const schedule = await Schedule.findById(scheduleId);
    if (!user || !schedule)
      return res.status(404).json({ error: 'User or schedule not found' });

    const reservationIndex = user.reservedSeats.findIndex(
      r => r.schedule.equals(scheduleId) && r.seatNumber === seatNumber
    );
    if (reservationIndex === -1)
      return res.status(404).json({ error: 'Reservation not found for this seat' });

    // Remove reservation from user
    user.reservedSeats.splice(reservationIndex, 1);
    await user.save();

    // Decrement seat count (never < 0)
    schedule.seatsBooked = Math.max(schedule.seatsBooked - 1, 0);
    await schedule.save();

    res.json({ success: true, message: 'Reservation cancelled', reservedSeats: user.reservedSeats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Get all reservations for a user
router.get('/users/:id/reservations', async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId)
      .populate({
        path: 'reservedSeats.schedule',
        populate: { path: 'bus stop' }
      });

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ reservedSeats: user.reservedSeats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error', details: err.message });
  }
});

module.exports = router;
module.exports.helpers = { timeToMinutes, formatTime, selectBestSchedule };
