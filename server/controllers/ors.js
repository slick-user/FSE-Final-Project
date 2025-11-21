// uses OpenRouteService v2
const axios = require('axios');

const ORS_KEY = process.env.ORS_API_KEY;

if (!ORS_KEY) {
  console.warn('ORS API key missing. Set process.env.ORS_API_KEY');
}

async function getRouteBetween(start, end) {
  // start/end = { lat, lng } objects
  const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';

  const body = {
    coordinates: [
      [start.lng, start.lat],
      [end.lng, end.lat]
    ],
    radiuses: [
      50,
      300
    ],
    /*           Might work when ORS Updates With the latest OpenStreetMap Data
    options: {
      // These options apply to the entire route, but help restrict the start/end points
      driving_car: {
        // Set restrictions on the snapping behavior for the start and end points
        snap_preventions: [
          'motorway',        // Don't snap to motorways
          'trunk'            // Don't snap to major non-motorway highways
        ],
        // Filter the start point based on road types allowed
        point_options: {
          // Options for the start point (index 0)
          0: {
            // Tell ORS to only consider snapping onto these road types:
            restricted_to: ['tertiary', 'service', 'unclassified']
          }
        }
      }
    }
    */
  };

  const res = await axios.post(url, body, {
    headers: {
      Authorization: ORS_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/geo+json'
    },
    timeout: 10000
  });

  // response is GeoJSON FeatureCollection with features[0] being route
  return res.data;
}

module.exports = { getRouteBetween };
