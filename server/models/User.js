const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Name is required'], 
    trim: true 
  },
  password: { 
    type: String, 
    required: [true, 'Password is required'],
    select: false // Don't include in queries by default
  },
  rollNo: { 
    type: String, 
    required: [true, 'Roll number is required'], 
    unique: true, 
    trim: true,
    uppercase: true
  },
  role: { 
    type: String, 
    enum: ['student', 'admin', 'driver'], 
    default: 'student' 
  },
  disability: { 
    type: Boolean, 
    default: false 
  },
  profilePhoto: { 
    type: String, 
    default: null 
  },
  resetCode: { 
    type: String,
    select: false
  },
  resetCodeExpiry: {
    type: Date,
    select: false
  },
  
  reservedSeats: [{
    schedule: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Schedule', 
      required: true 
    },
    seatNumber: { 
      type: Number, 
      required: true,
      min: 1
    },
    status: { 
      type: String, 
      enum: ['reserved', 'cancelled'], 
      default: 'reserved' 
    },
    reservedAt: { 
      type: Date, 
      default: Date.now 
    }
  }],
  
  driverProfile: {
    assignedBus: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Bus' 
    },
    available: { 
      type: Boolean, 
      default: true 
    },
    licenseNumber: String,
    phoneNumber: String
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
userSchema.index({ rollNo: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'reservedSeats.schedule': 1 });

// Virtual for active reservations
userSchema.virtual('activeReservations').get(function() {
  return this.reservedSeats.filter(r => r.status === 'reserved');
});

// Method to check if user has reserved a specific seat
userSchema.methods.hasReservedSeat = function(scheduleId, seatNumber) {
  return this.reservedSeats.some(
    r => r.schedule.equals(scheduleId) && 
         r.seatNumber === seatNumber && 
         r.status === 'reserved'
  );
};

module.exports = mongoose.model('User', userSchema);