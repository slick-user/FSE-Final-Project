const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const routes = require("./routes/routes.js");
const { connectDB } = require("./config/db.js");

// Not how I wanted to do this initially, but it works for now
const stopsRoutes = require('./controllers/stops.js');
const mapRouteRoutes = require('./controllers/maproute.js');
const busRoutes = require('./controllers/bus.js');

dotenv.config({ override:true, path:'.env'});

const app = express();

// Middleware
app.use(cors());
//                Allows our server to read JSON data
app.use(express.json());


app.use('/api/stops', stopsRoutes);
app.use('/api/route', mapRouteRoutes);
app.use('/api/buses', busRoutes);


app.use(express.static(path.join(__dirname, "../client")));
app.use('/static', express.static(path.join(__dirname, '../client', 'static')));

// connect to MongoDB
connectDB();

// Routes
app.use("/", routes);

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(5000, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
