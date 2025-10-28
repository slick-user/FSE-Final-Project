const express = require("express");
//const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

// connect to MongoDB
/*mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));
*/

// basic route
app.get("/", (req, res) => res.send("Server running ✅"));

// start server
app.listen(5000, () => console.log("Server running on port 5000"));

