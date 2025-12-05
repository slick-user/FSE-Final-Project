const axios = require('axios');
const config = require('../config/env');
const Stop = require('../models/Stop.js');
const Schedule = require('../models/Schedule.js');
const { timeToMinutes, formatTime, isToday } = require('../utils/timeHelpers');

const FAST_COORDS = { lat: 33.6405, lng: 73.0372 };

// Get route from FAST to stop using OpenRouteService
async function getRouteGeoJSON(stopCoordinates) {
  const url = 'https://api.openrouteservice.org/v2/directions/driving-car/geojson';
  
  try {
    const response = await axios.post(url, {
      coordinates: [
        [FAST_COORDS.lng, FAST_COORDS.lat],
        [stopCoordinates.lng, stopCoordinates.lat]
      ],
      radiuses: [50, 300]
    }, {
      headers: {
        'Authorization': config.ors.apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/geo+json'
      },
      timeout: 10000
    });
    
    return response.data;
  } catch (error) {
    console.error('ORS API Error:', error.response?.data || error.message);
    throw new Error('Failed to calculate route');
  }
}

// Find best schedule for given stop and time
function selectBestSchedule(schedules, requestedTimeMinutes) {
  let bestFuture = null;
  let bestPast = null;
  let smallestFutureDiff = Infinity;
  let largestPastDiff = -Infinity;
  
  for (const schedule of schedules) {
    const scheduleMinutes = timeToMinutes(schedule.departureTime);
    const diff = scheduleMinutes - requestedTimeMinutes;
    
    if (diff >= 0) {
      // Future departure
      if (diff < smallestFutureDiff) {
        bestFuture = schedule;
        smallestFutureDiff = diff;
      }
    } else {
      // Past departure
      if (diff > largestPastDiff) {
        bestPast = schedule;
        largestPastDiff = diff;
      }
    }
  }
  
  // Prefer future departures, fall back to most recent past
  return {
    schedule: bestFuture || bestPast,
    isToday: !!bestFuture
  };
}

// Find bus allocation for stop and time
exports.findBusAllocation = async (stopId, requestedTime) => {
  // Get stop details
  const stop = await Stop.findById(stopId);
  if (!stop) {
    throw new Error('Stop not found');
  }
  
  // Get today's schedules for this stop
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const schedules = await Schedule.find({
    stop: stopId,
    date: today,
    status: 'scheduled'
  }).populate('bus');
  
  if (schedules.length === 0) {
    throw new Error('No buses scheduled for this stop today');
  }
  
  // Find best matching schedule
  const requestedMinutes = timeToMinutes(requestedTime);
  const { schedule, isToday: scheduleIsToday } = selectBestSchedule(
    schedules, 
    requestedMinutes
  );
  
  if (!schedule) {
    throw new Error('No suitable bus found');
  }
  
  // Get route information
  const routeGeoJSON = await getRouteGeoJSON({
    lat: stop.location.coordinates[1],
    lng: stop.location.coordinates[0]
  });
  
  const feature = routeGeoJSON.features?.[0];
  const summary = feature?.properties?.summary || {};
  const distance_km = ((summary.distance || 0) / 1000).toFixed(1);
  const travel_time_min = Math.round((summary.duration || 0) / 60);
  
  return {
    schedule,
    stop,
    route: routeGeoJSON,
    isToday: scheduleIsToday,
    distance_km,
    travel_time_min
  };
};
