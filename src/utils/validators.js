const validateQuizInput = (input) => {
  const { grade, Subject, TotalQuestions, MaxScore, Difficulty } = input;

  if (!grade || !Subject || !TotalQuestions || !MaxScore || !Difficulty) {
    throw new Error("Missing required fields");
  }

  if (!["EASY", "MEDIUM", "HARD"].includes(Difficulty)) {
    throw new Error("Difficulty must be one of: EASY, MEDIUM, HARD");
  }

  return true;
};

const validateQuestionId = (questionId) => {
  if (!questionId) {
    throw new Error("Question ID is required");
  }
  return true;
};

module.exports = {
  validateQuizInput,
  validateQuestionId,
}; 