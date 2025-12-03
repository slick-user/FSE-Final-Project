const mongoose = require("mongoose");

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

module.exports = {connectDB};
