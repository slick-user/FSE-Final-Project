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

// ========== BUS CRUD ==========

// GET all buses
router.get('/', async (req, res) => {
  try {
    const buses = await Bus.find().sort({ busNumber: 1 });
    res.json(buses);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET a single bus
router.get('/view/:id', async (req, res) => {
  try {
    const bus = await Bus.findById(req.params.id);
    if (!bus) return res.status(404).json({ error: "Bus not found" });
    res.json(bus);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADD bus
router.post('/add', async (req, res) => {
  try {
    const bus = await Bus.create(req.body);
    res.json(bus);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE bus
router.put('/update/:id', async (req, res) => {
  try {
    const bus = await Bus.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!bus) return res.status(404).json({ error: 'Bus not found' });
    res.json(bus);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE bus (and its schedules)
router.delete('/delete/:id', async (req, res) => {
  try {
    const bus = await Bus.findByIdAndDelete(req.params.id);
    if (!bus) return res.status(404).json({ error: "Bus not found" });

    await Schedule.deleteMany({ bus: req.params.id });

    res.json({ message: "Bus removed successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});


// GET all schedules
router.get('/schedules', async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('bus')
      .populate('stop')
      .sort({ date: 1, departureTime: 1 });

    res.json(schedules);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET schedules for one bus
router.get('/bus/:busId', async (req, res) => {
  const schedules = await Schedule.find({ bus: req.params.busId })
    .populate('stop')
    .sort({ date: 1 });
  res.json(schedules);
});

// GET schedules for one stop
router.get('/stop/:stopId', async (req, res) => {
  const schedules = await Schedule.find({ stop: req.params.stopId })
    .populate('bus')
    .sort({ date: 1 });
  res.json(schedules);
});

// GET schedules by date
router.get('/date/:date', async (req, res) => {
  const parsed = new Date(req.params.date);
  const schedules = await Schedule.find({ date: parsed })
    .populate('bus')
    .populate('stop');
  res.json(schedules);
});

// ADD schedule
router.post('/add', async (req, res) => {
  try {
    const schedule = await Schedule.create(req.body);
    res.json(schedule);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE schedule
router.delete('/delete/:id', async (req, res) => {
  try {
    const deleted = await Schedule.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Schedule not found' });
    res.json({ message: 'Schedule removed successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE all schedules for a bus
router.delete('/bus/:busId', async (req, res) => {
  const result = await Schedule.deleteMany({ bus: req.params.busId });
  res.json({ deleted: result.deletedCount });
});

module.exports = router;
