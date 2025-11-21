const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { type: String, required: true },
  zone: String,
  fee: Number,
  startsFrom: { type: String, default: 'FAST University' },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [lng, lat]
  }
}, { timestamps: true });

stopSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Stop', stopSchema);
