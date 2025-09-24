const express = require("express");
const helloController = require("../controllers/helloController");
const { authenticate } = require("../middlewares/auth");

const router = express.Router();

// Protected route - requires authentication
router.get("/hello", authenticate, helloController.helloWorld);

module.exports = router;
