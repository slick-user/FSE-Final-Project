const express = require('express');
const Bus = require('../config/bus.js');
const Schedule = require('../config/schedule.js');
const Stop = require('../config/stop.js');
const router = express.Router();

// POST /api/buses/assign
// body: { busId, stopId, driverName, departureTime, date }
router.post('/assign', async (req, res) => {
  const { busId, stopId, driverName, departureTime, date } = req.body;
  if (!busId || !stopId || !date || !departureTime) {
    return res.status(400).json({ error: 'busId, stopId, date, departureTime required' });
  }

  const bus = await Bus.findById(busId);
  const stop = await Stop.findById(stopId);
  if (!bus || !stop) return res.status(404).json({ error: 'Bus or Stop not found' });

  // Simple conflict check: is bus already scheduled that date/time?
  const existing = await Schedule.findOne({ bus: busId, date: new Date(date), departureTime });
  if (existing) return res.status(409).json({ error: 'Bus already assigned at that time' });

  // If you want route duration estimation, call ORS here (omitted for brevity)
  const schedule = new Schedule({
    bus: bus._id,
    stop: stop._id,
    driverName,
    departureTime,
    date: new Date(date),
    status: 'scheduled'
  });

  await schedule.save();
  res.json({ ok: true, schedule });
});

// GET /api/buses/schedules
router.get('/schedules', async (req, res) => {
  const schedules = await Schedule.find()
    .populate('bus')
    .populate('stop')
    .sort({ date: 1, departureTime: 1 });

  res.json(schedules);
});

module.exports = router;
