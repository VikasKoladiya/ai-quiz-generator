const { initializeOpenAIClient } = require("../config/openai");
const { getSystemPrompt, getUserPrompt } = require("../templates/prompts");
const { validateQuizInput, validateQuestionId } = require("../utils/validators");
const quizService = require("../services/quizService");
const redisClient = require("../config/redis");

// Generate questions based on input parameters
const generateQuestions = async (req, res) => {
  try {
    // Validate input
    validateQuizInput(req.body);

    // Initialize OpenAI client
    const client = initializeOpenAIClient();

    // Create messages for OpenAI
    const messages = [
      { role: "system", content: getSystemPrompt() },
      { role: "user", content: getUserPrompt(req.body) },
    ];

    // Call Azure OpenAI API
    const response = await client.chat.completions.create({
      messages,
      max_tokens: 2000,
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    // Extract and parse the generated questions
    const generatedContent = response.choices[0].message.content;
    let questionsData;

    try {
      questionsData = JSON.parse(generatedContent);
    } catch (error) {
      console.error("Error parsing generated content:", error);
      return res.status(500).json({
        success: false,
        message: "Error processing the generated questions",
      });
    }

    // Persist the quiz and questions
    try {
      const quiz = await quizService.createQuiz(req.body, req.user?.id);
      await quizService.createQuestions(quiz.id, questionsData.questions || []);

      return res.status(200).json({
        success: true,
        data: {
          quizId: quiz.quiz_id,
        },
      });
    } catch (dbError) {
      console.error("Error persisting quiz in database:", dbError);
      return res.status(200).json({
        success: false,
        persistenceError:
          "Failed to save quiz to database, but questions were generated successfully",
      });
    }
  } catch (error) {
    console.error("Error generating questions:", error);
    res.status(500).json({
      success: false,
      message: "Error generating questions",
      error: error.message,
    });
  }
};

// Get quiz by ID
const getQuizById = async (req, res) => {
  try {
    const { quizId } = req.params;
    // Try to get from cache first
    const cacheKey = `quiz:${quizId}`;
    const cachedQuiz = await redisClient.get(cacheKey);
    if (cachedQuiz) {
      return res.status(200).json({
        success: true,
        data: JSON.parse(cachedQuiz),
        cached: true,
      });
    }
    const quiz = await quizService.getQuizById(quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }
    // Store in cache for future requests
    await redisClient.set(cacheKey, JSON.stringify({
      quizId: quiz.quiz_id,
      subject: quiz.subject,
      grade: quiz.grade,
      difficulty: quiz.difficulty,
      totalQuestions: quiz.totalquestions,
      maxScore: quiz.maxscore,
      createdAt: quiz.created_at,
      questions: quiz.questions,
    }), {
      EX: 3600 // 1 hour expiry
    });
    return res.status(200).json({
      success: true,
      data: {
        quizId: quiz.quiz_id,
        subject: quiz.subject,
        grade: quiz.grade,
        difficulty: quiz.difficulty,
        totalQuestions: quiz.totalquestions,
        maxScore: quiz.maxscore,
        createdAt: quiz.created_at,
        questions: quiz.questions,
      },
      cached: false,
    });
  } catch (error) {
    console.error("Error retrieving quiz:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving quiz",
      error: error.message,
    });
  }
};

// Get hint for a specific question
const getQuestionHint = async (req, res) => {
  try {
    const { questionId } = req.params;
    validateQuestionId(questionId);

    const hint = await quizService.getQuestionHint(questionId);

    if (!hint) {
      return res.status(404).json({
        success: false,
        message: "No hint available for this question",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        questionId,
        hint,
      },
    });
  } catch (error) {
    console.error("Error retrieving question hint:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving question hint",
      error: error.message,
    });
  }
};

module.exports = {
  generateQuestions,
  getQuizById,
  getQuestionHint,
};
