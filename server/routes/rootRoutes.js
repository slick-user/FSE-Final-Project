const express = require("express");
const { getRoot } = require("../controllers/rootController.js");

const router = express.Router();

router.get("/", getRoot);

module.exports = router;
