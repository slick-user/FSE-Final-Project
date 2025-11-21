const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { type: String, required: true, unique: true },
  capacity: { type: Number, default: 40 },
  status: { type: String, enum: ['active','maintenance','inactive'], default: 'active' },
  currentLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0,0] }
  }
}, { timestamps: true });

module.exports = mongoose.model('Bus', busSchema);
