const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  //email: {
    //type: String,
    //required: true,  not required for the time being
    //unique: true,
    //lowercase: true
  //},

  password: {
    type: String,
    required: true
  },

  rollNo: {
    type: String,
    required: true,
    unique: true
  },

  //Photo: {
    //type: String
  //},

  role: {
    type: String,
    enum: ['student', 'admin'], // Do we want to save Driver as a role for here?
    default: 'student'
  },

  disability: {
    type: Boolean,
    default: false
  },

  createdAt: {
    type: Date,
    default: Date.now
  },

  resetCode: {
    type: String,
  },
  
  reservedSeats: [
    {
      schedule: {type: mongoose.Schema.Types.ObjectId, ref: 'Schedule', required: true },
      seatNumber: { type: Number, required: true },
      status: { type: String, enum: ['reserved'], default: 'reserved' }
    }
  ]

});

const User = mongoose.model('User', userSchema);

const connectDB = async () => {
  try {
    const URI = process.env.MONGO_URI;
    //console.log("connecting to:", URI);
    const conn = await mongoose.connect(URI);
    console.log(`Mongo DB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`Error: ${err.message}`);
    process.exit(1);
  }
};

module.exports = {connectDB, User};
