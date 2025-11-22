const express = require("express");
const path = require("path");
const { getRoot, getAllUsers, registerUser, loginUser, forgotPassword, resetPassword, authAdmin } = require("../controllers/controller.js");

const router = express.Router();

// BACK END ROUTES
router.get("/api", getRoot);
router.get("/api/users", getAllUsers);
router.post("/api/register", registerUser);
router.post("/api/login", loginUser);
router.post('/api/forgot-password', forgotPassword);
router.post('/api/reset-password', resetPassword);

//router.get('/admin/dashboard', auth, authAdmin, (req, res) => {});

// FRONT END ROUTES
const clientPath = path.join(__dirname, '../../client');

router.get("/", (req, res) => { res.sendFile(path.join(clientPath,"index.html")); });

router.get("/index.html", (req, res) => { res.sendFile(path.join(clientPath,"index.html")); });

// 2. Serve the Bus Allocator Page
router.get("/allocator.html", (req, res) => { res.sendFile(path.join(clientPath, 'allocator.html')); });

// 3. Serve the Meet The Team Page
router.get("/team.html", (req, res) => { res.sendFile(path.join(clientPath, 'team.html')); });

// Call the Login page
router.get("/login", (req, res) => { res.sendFile(path.join(__dirname, "../client/login.html")); });


router.get("/admin", (req, res) => { 
    res.sendFile(path.join(clientPath, "admin.html")); 
});

router.get('/admin/routes', (req, res) => {
    // You'll need to create this file
    res.sendFile(path.join(clientPath, 'admin-panels/routes-panel.html'));
});

router.get('/admin/stops', (req, res) => {
    // You'll need to create this file
    res.sendFile(path.join(clientPath, 'admin-panels/stops-panel.html'));
});

router.get('/admin/routes', (req, res) => {
    // This should send the HTML snippet for the routes panel
    res.send('<h2 class="text-3xl font-bold mb-6">🛣️ Manage Routes</h2><p class="text-gray-600">This section is under construction.</p>');
});

module.exports = router;
