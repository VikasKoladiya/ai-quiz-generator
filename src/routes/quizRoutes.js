const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quizController");
const { authenticate } = require("../middlewares/auth");
const { QUIZ_ROUTES } = require("../constants/routes");

// Submit quiz answers
router.post(QUIZ_ROUTES.SUBMIT, authenticate, quizController.submitQuiz);

// Get quiz history with filters
router.get(QUIZ_ROUTES.HISTORY, authenticate, quizController.getQuizHistory);

module.exports = router;
