const express = require("express");
const { getRoot, getAllUsers, registerUser } = require("../controllers/controller.js");

const router = express.Router();

router.get("/", getRoot);
router.get("/users", getAllUsers);
router.post("/register", registerUser);
//router.post("/login", loginUser);

module.exports = router;
