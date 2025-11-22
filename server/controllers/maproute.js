const express = require('express');
const Stop = require('../config/stop.js');
const Bus = require('../config/bus.js');
const Schedule = require('../config/schedule.js');
const { getRouteBetween } = require('../controllers/ors.js');
const router = express.Router();

// FAST UNIVERSITY COORDS
const FAST_COORDS = { lat: 33.6405, lng: 73.0372 };

// Helper: Convert time string to minutes since midnight
function timeToMinutes(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

// Helper: Format time in 12-hour format
function formatTime(timeStr) {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
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
    let bestSchedule = null;
    let smallestDiff = Infinity;
    let isToday = false;

    for (const schedule of schedules) {
      const departureMinutes = timeToMinutes(schedule.departureTime);
      const diff = departureMinutes - requestedMinutes;
      
      // Prefer buses departing after requested time (diff > 0) or closest one before
      if (diff >= 0 && diff < smallestDiff) {
        bestSchedule = schedule;
        smallestDiff = diff;
        isToday = true;
      } else if (diff < 0 && Math.abs(diff) < Math.abs(smallestDiff) && !isToday) {
        // If no future bus, pick the most recent past one
        bestSchedule = schedule;
        smallestDiff = diff;
      }
    }

    // If no match found, suggest earliest next day bus
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

module.exports = router;
