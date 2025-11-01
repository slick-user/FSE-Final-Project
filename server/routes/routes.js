const express = require("express");
const path = require("path");
const { getRoot, getAllUsers, registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/controller.js");

const router = express.Router();

router.get("/api", getRoot);
router.get("/api/users", getAllUsers);
router.post("/api/register", registerUser);
router.post("/api/login", loginUser);
router.post('/api/forgot-password', forgotPassword);
router.post('/api/reset-password', resetPassword);

// FRONT END ROUTES
const clientPath = path.join(__dirname, '../../client');

router.get("/", (req, res) => {
  res.sendFile(path.join(clientPath,"index.html"));
});

router.get("/index.html", (req, res) => {
  res.sendFile(path.join(clientPath,"index.html"));
});

// 2. Serve the Bus Allocator Page
router.get("/allocator.html", (req, res) => {
    res.sendFile(path.join(clientPath, 'allocator.html'));
});

// 3. Serve the Meet The Team Page
router.get("/team.html", (req, res) => {
    res.sendFile(path.join(clientPath, 'team.html'));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/login.html"));
});

module.exports = router;
