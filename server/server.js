const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const routes = require("./routes/routes.js");
const { connectDB } = require("./config/db.js");

dotenv.config({ override:true, path:'../.env'});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// connect to MongoDB
connectDB();

// Routes
app.use("/", routes);

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(5000, () => console.log(`Server running on port ${PORT}`));

