const { v4: uuidv4 } = require("uuid");
const { initializeOpenAIClient } = require("../config/openai");
const { getEvaluationPrompt } = require("../templates/prompts");
const quizService = require("../services/quizService");

// Submit quiz answers and evaluate score
exports.submitQuiz = async (req, res) => {
  try {
    // Extract quiz ID and user responses from request body
    const { quizId, responses } = req.body;

    if (
      !quizId ||
      !responses ||
      !Array.isArray(responses) ||
      responses.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid request body. quizId and responses array are required.",
      });
    }

    // Get user ID from authentication middleware
    const userId = req.user.id;

    // Generate a unique submission ID
    const submissionId = uuidv4();

    // Retrieve quiz information from database
    const quiz = await quizService.getQuizWithQuestions(quizId);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    const quizQuestions = quiz.questions;

    // Format quiz and user responses for OpenAI evaluation
    const evaluationPayload = {
      quiz_id: quiz.id,
      user_id: userId,
      submission_id: submissionId,
      questions: quizQuestions,
      responses: responses,
    };

    // Initialize OpenAI client
    const client = initializeOpenAIClient();

    // Call Azure OpenAI API for evaluation
    const messages = [
      {
        role: "system",
        content: getEvaluationPrompt(),
      },
      {
        role: "user",
        content:
          "\n\nHere's the quiz data to evaluate:\n" +
          JSON.stringify(evaluationPayload, null, 2),
      },
    ];

    const response = await client.chat.completions.create({
      messages,
      max_tokens: 2000,
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    // Extract the evaluation results
    const evaluationContent = response.choices[0].message.content;
    let evaluationData;

    try {
      evaluationData = JSON.parse(evaluationContent);
    } catch (error) {
      console.error("Error parsing evaluation content:", error);
      return res.status(500).json({
        success: false,
        message: "Error processing the evaluation results",
      });
    }

    try {
      // Save the submission to database
      await quizService.saveQuizSubmission(
        evaluationData.quizSubmission,
        evaluationData.submissionResponses
      );

      // Return the evaluation results
      return res.status(200).json({
        success: true,
        data: {
          submissionId: submissionId,
        },
      });
    } catch (dbError) {
      console.error("Error persisting quiz submission:", dbError);
      return res.status(500).json({
        success: false,
        message: "Failed to save quiz submission to database",
        error: dbError.message,
      });
    }
  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting quiz",
      error: error.message,
    });
  }
};

// Get quiz history with filters
exports.getQuizHistory = async (req, res) => {
  try {
    // Extract query parameters for filtering
    const { quizId, grade, subject, minScore, maxScore, from, to } = req.query;

    // Get authenticated user's ID from middleware
    const userId = req.user.id;

    try {
      const history = await quizService.getQuizHistory(userId, {
        quizId,
        grade,
        subject,
        minScore,
        maxScore,
        from,
        to,
      });

      // Return the filtered quiz history
      return res.status(200).json({
        success: true,
        count: history.length,
        data: history,
      });
    } catch (error) {
      console.error("Error retrieving quiz history:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Error retrieving quiz history",
      });
    }
  } catch (error) {
    console.error("Error retrieving quiz history:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving quiz history",
      error: error.message,
    });
  }
};
