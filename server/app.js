const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const routes = require("./routes/routes.js");
const { connectDB } = require("./config/db.js");

// Controllers (acting as routers)
const stopsRoutes = require("./controllers/stops.js");
const mapRouteRoutes = require("./controllers/maproute.js");
const busRoutes = require("./controllers/bus.js");

// Load .env
dotenv.config({ override: true, path: ".env" });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/stops", stopsRoutes);
app.use("/api/route", mapRouteRoutes);
app.use("/api/buses", busRoutes);

// Static Files
app.use(express.static(path.join(__dirname, "../client")));
app.use("/static", express.static(path.join(__dirname, "../client", "static")));

// Connect to MongoDB
if (process.env.NODE_ENV !== "test") {
  connectDB();
}

// Base Routes
app.use("/", routes);

module.exports = app;
