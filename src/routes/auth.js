const express = require("express");
const authController = require("../controllers/authController");
const { AUTH_ROUTES } = require("../constants/routes");

const router = express.Router();

// Authentication routes
router.post(AUTH_ROUTES.SIGNUP, authController.signup);
router.post(AUTH_ROUTES.LOGIN, authController.login);

module.exports = router;
