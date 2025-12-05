const mongoose = require('mongoose');

const busSchema = new mongoose.Schema({
  busNumber: { 
    type: String, 
    required: [true, 'Bus number is required'], 
    unique: true,
    trim: true,
    uppercase: true
  },
  model: { 
    type: String, 
    required: [true, 'Bus model is required'] 
  },
  driverName: { 
    type: String, 
    required: [true, 'Driver name is required'] 
  },
  linkedUser: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User' 
  },
  capacity: { 
    type: Number, 
    default: 40,
    min: [1, 'Capacity must be at least 1'],
    max: [100, 'Capacity cannot exceed 100']
  },
  status: { 
    type: String, 
    enum: ['active', 'maintenance', 'inactive'], 
    default: 'active' 
  },
  currentLocation: {
    type: { 
      type: String, 
      enum: ['Point'], 
      default: 'Point' 
    },
    coordinates: { 
      type: [Number], 
      default: [73.0372, 33.6405] // FAST University
    }
  }
}, { 
  timestamps: true 
});

// Indexes
busSchema.index({ busNumber: 1 });
busSchema.index({ status: 1 });
busSchema.index({ currentLocation: '2dsphere' });

module.exports = mongoose.model('Bus', busSchema);
