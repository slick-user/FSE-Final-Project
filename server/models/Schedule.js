const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  bus: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Bus', 
    required: [true, 'Bus is required']
  },
  stop: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Stop', 
    required: [true, 'Stop is required']
  },
  routeName: { 
    type: String, 
    required: [true, 'Route name is required']
  },
  seatsBooked: { 
    type: Number, 
    default: 0,
    min: 0
  },
  departureTime: { 
    type: String, 
    required: [true, 'Departure time is required'],
    match: [/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (use HH:MM)']
  },
  status: { 
    type: String, 
    enum: ['scheduled', 'running', 'completed', 'cancelled'], 
    default: 'scheduled' 
  },
  recurringDaily: {
    type: Boolean,
    default: true
  },
  date: { 
    type: Date, 
    required: [true, 'Date is required']
  }
}, { 
  timestamps: true 
});

// Indexes
scheduleSchema.index({ bus: 1, date: 1, departureTime: 1 });
scheduleSchema.index({ stop: 1, date: 1 });
scheduleSchema.index({ status: 1 });

// Virtual for checking if bus is full
scheduleSchema.virtual('isFull').get(function() {
  return this.populated('bus') && this.seatsBooked >= this.bus.capacity;
});

// Method to check available seats
scheduleSchema.methods.getAvailableSeats = async function() {
  await this.populate('bus');
  return this.bus.capacity - this.seatsBooked;
};

module.exports = mongoose.model('Schedule', scheduleSchema);