const express = require("express");
const { authenticate, accessControl } = require("../middlewares/auth");
const {
  generateQuestions,
  getQuizById,
  getQuestionHint,
} = require("../controllers/questionController");
const { QUESTION_ROUTES } = require("../constants/routes");

const router = express.Router();

// Protected route - requires authentication
router.post(QUESTION_ROUTES.GENERATE, authenticate, accessControl(["teacher"]), generateQuestions);

// Get quiz by ID
router.get(QUESTION_ROUTES.GET_QUIZ, authenticate, getQuizById);

// Get hint for a specific question in a quiz
router.get(QUESTION_ROUTES.GET_HINT, authenticate, getQuestionHint);

module.exports = router;
