const mongoose = require('mongoose');

const stopSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Stop name is required'],
    trim: true
  },
  zone: { 
    type: String,
    enum: ['Islamabad', 'Rawalpindi'],
    required: [true, 'Zone is required']
  },
  fee: { 
    type: Number,
    min: 0,
    default: 0
  },
  startsFrom: { 
    type: String, 
    default: 'FAST University' 
  },
  location: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], 
      required: [true, 'Coordinates are required']
    }
  }
}, { 
  timestamps: true 
});

// Geospatial index
stopSchema.index({ location: '2dsphere' });
stopSchema.index({ zone: 1, name: 1 });

module.exports = mongoose.model('Stop', stopSchema);