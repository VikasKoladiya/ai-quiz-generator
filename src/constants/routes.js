// Question routes
const QUESTION_ROUTES = {
  GENERATE: '/generate-questions',
  GET_QUIZ: '/quiz/:quizId',
  GET_HINT: '/:questionId/hint'
};

// Quiz routes
const QUIZ_ROUTES = {
  SUBMIT: '/submit',
  HISTORY: '/history'
};

// Auth routes
const AUTH_ROUTES = {
  SIGNUP: '/signup',
  LOGIN: '/login'
};

module.exports = {
  QUESTION_ROUTES,
  QUIZ_ROUTES,
  AUTH_ROUTES
}; 