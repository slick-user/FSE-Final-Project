const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");

const rootRoutes = require("./routes/rootRoutes.js");
const connectDB = require("./config/db.js");

dotenv.config({ path: path.resolve("../.env") });

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.URI;
console.log("MONGO URI:", MONGO_URI);

console.log("All env vars:", process.env);

// connect to MongoDB
connectDB();

// Routes
app.use("/", rootRoutes);

// Server Listen
const PORT = process.env.PORT;
app.listen(5000, () => console.log(`Server running on port ${PORT}`));

