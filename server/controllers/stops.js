const express = require('express');
const Stop = require('../config/stop.js');
const router = express.Router();

// GET /api/stops
router.get('/', async (req, res) => {
  const stops = await Stop.find().sort({ zone: 1, name: 1 });
  res.json(stops);
});

// GET /api/stops/:id
router.get('/:id', async (req, res) => {
  const stop = await Stop.findById(req.params.id);
  if (!stop) return res.status(404).json({ error: 'Stop not found' });
  res.json(stop);
});

// POST /api/stops/seed  (optional, use only in dev)
router.post('/seed', async (req, res) => {
  // Expect payload: { stops: [...] } where each stop has name, zone, fee, location
  const { stops } = req.body;
  if (!Array.isArray(stops)) return res.status(400).json({ error: 'stops array required' });

  await Stop.deleteMany({});
  await Stop.insertMany(stops);
  res.json({ ok: true, count: stops.length });
});

module.exports = router;
