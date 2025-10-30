const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const routes = require("./routes/routes.js");
const { connectDB } = require("./config/db.js");

dotenv.config({ override:true, path:'../.env'});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// connect to MongoDB
connectDB();

// Routes
app.use("/", routes);

// Server Listen
const PORT = process.env.PORT || 5000;
app.listen(5000, () => console.log(`Server running on port ${PORT}`));

