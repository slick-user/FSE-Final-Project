const express = require("express");
const { getRoot, getAllUsers, registerUser, getFeedback, getRoutes } = require("../controllers/controller.js");

const router = express.Router();

router.get("/", getRoot);
router.get("/api/feedback", getFeedback);
router.get("/api/routes", getRoutes);
router.get("/users", getAllUsers);
router.post("/register", registerUser);

module.exports = router;
