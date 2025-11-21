const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  bus: { type: mongoose.Schema.Types.ObjectId, ref: 'Bus', required: true },
  stop: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop', required: true },
  driverName: String,
  departureTime: String, // '07:30' (local time)
  durationMinutes: Number,
  expectedArrivalIso: Date,
  status: { type: String, enum: ['scheduled','running','completed','cancelled'], default: 'scheduled' },
  date: { type: Date, required: true } // run date
}, { timestamps: true });

module.exports = mongoose.model('Schedule', scheduleSchema);
