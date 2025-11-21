const express = require('express');
const Stop = require('../config/stop.js');
const { getRouteBetween } = require('../controllers/ors.js');
const router = express.Router();

// FAST UNIVERSITY COORDS
const FAST_COORDS = { lat: 33.6405, lng: 73.0372 }; // replace with your accurate coords

// GET /api/route?stopId=...
router.get('/', async (req, res) => {
  const { stopId } = req.query;
  if (!stopId) return res.status(400).json({ error: 'stopId query required' });

  const stop = await Stop.findById(stopId);
  if (!stop) return res.status(404).json({ error: 'Stop not found' });

  const start = FAST_COORDS;
  const end = { lat: stop.location.coordinates[1], lng: stop.location.coordinates[0] };

  try {
    const routeGeoJSON = await getRouteBetween(start, end);

    // Basic payload to frontend; may include routeGeoJSON, distance, duration
    // ORS provides summary in features[0].properties.summary
    const feature = routeGeoJSON.features && routeGeoJSON.features[0];
    const summary = feature?.properties?.summary || {};
    const distance_m = summary.distance || null;
    const duration_s = summary.duration || null;

    res.json({
      stop,
      route: routeGeoJSON,
      distance_m,
      duration_s
    });
  } catch (err) {
    console.error(err?.response?.data || err.message);
    return res.status(502).json({ error: 'Routing failed', details: err?.message || err });
  }
});

module.exports = router;
