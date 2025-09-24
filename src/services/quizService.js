const { v4: uuidv4 } = require("uuid");
const db = require("../config/db");

const createQuiz = async (quizData, userId) => {
  const client = await db.getClient();
  await client.query("BEGIN");

  try {
    const quizId = uuidv4();
    const quizResult = await client.query(
      `INSERT INTO quizzes 
       (quiz_id, subject, grade, difficulty, totalQuestions, maxScore, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        quizId,
        quizData.Subject,
        quizData.grade,
        quizData.Difficulty,
        quizData.TotalQuestions,
        quizData.MaxScore,
        userId,
      ]
    );

    const quiz = quizResult.rows[0];
    await client.query("COMMIT");
    return quiz;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

const createQuestions = async (quizId, questions) => {
  const client = await db.getClient();
  await client.query("BEGIN");

  try {
    for (const question of questions) {
      const questionId = uuidv4();
      await client.query(
        `INSERT INTO questions 
         (question_id, quiz_id, question, options, correctAnswer, score, hint)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          questionId,
          quizId,
          question.question,
          JSON.stringify(question.options),
          question.correctAnswer,
          question.score,
          question.hint || null,
        ]
      );
    }
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
};

const getQuizById = async (quizId) => {
  const result = await db.query(
    `SELECT q.*, json_agg(
      json_build_object(
        'id', qs.id,
        'questionId', qs.question_id,
        'question', qs.question,
        'options', qs.options,
        'correctAnswer', qs.correctAnswer,
        'score', qs.score
      )
     ) as questions 
     FROM quizzes q 
     LEFT JOIN questions qs ON q.id = qs.quiz_id 
     WHERE q.quiz_id = $1 
     GROUP BY q.id`,
    [quizId]
  );
  return result.rows[0];
};

const getQuestionHint = async (questionId) => {
  const result = await db.query(
    `SELECT q.hint 
     FROM questions q 
     WHERE q.question_id = $1`,
    [questionId]
  );
  return result.rows[0]?.hint;
};

// Get quiz with questions by quiz ID
const getQuizWithQuestions = async (quizId) => {
  const result = await db.query(
    `SELECT q.*, json_agg(
      json_build_object(
        'id', qs.id,
        'questionId', qs.question_id,
        'question', qs.question,
        'options', qs.options,
        'correctAnswer', qs.correctAnswer,
        'score', qs.score
      )
     ) as questions 
     FROM quizzes q 
     LEFT JOIN questions qs ON q.id = qs.quiz_id 
     WHERE q.quiz_id = $1 
     GROUP BY q.id`,
    [quizId]
  );
  return result.rows[0];
};

// Save quiz submission and responses
const saveQuizSubmission = async (submissionData, responses) => {
  const client = await db.getClient();
  try {
    await client.query("BEGIN");

    // Insert quiz submission record
    const submissionResult = await client.query(
      `INSERT INTO quiz_submissions
       (submission_id, quiz_id, user_id, obtained_score, suggestion_text)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        submissionData.submission_id,
        submissionData.quiz_id,
        submissionData.user_id,
        submissionData.obtained_score,
        submissionData.suggestion_text,
      ]
    );

    const dbSubmissionId = submissionResult.rows[0].id;

    // Insert individual response records
    for (const response of responses) {
      await client.query(
        `INSERT INTO submission_responses
         (submission_id, question_id, correctAnswer, user_response, is_correct)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          dbSubmissionId,
          response.question_id,
          response.correctAnswer,
          response.user_response,
          response.is_correct,
        ]
      );
    }

    await client.query("COMMIT");
    return submissionData.submission_id;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// Get quiz history with filters
const getQuizHistory = async (userId, filters) => {
  const { quizId, grade, subject, minScore, maxScore, from, to } = filters;
  let queryParams = [];
  let paramIndex = 1;

  // Base query to join quiz_submissions with quizzes to get additional quiz info
  let query = `
    SELECT 
      qs.id as submission_id,
      qs.submission_id as unique_submission_id,
      qs.quiz_id,
      q.subject,
      q.grade,
      q.difficulty,
      qs.user_id,
      qs.obtained_score,
      q.maxScore as max_possible_score,
      qs.suggestion_text,
      qs.submitted_at,
      (qs.obtained_score * 100.0 / q.maxScore) as percentage_score
    FROM 
      quiz_submissions qs
    JOIN 
      quizzes q ON qs.quiz_id = q.id
    LEFT JOIN 
      submission_responses sr ON qs.id = sr.submission_id
    WHERE 1=1
  `;

  // Filter by user ID
  query += ` AND qs.user_id = $${paramIndex}`;
  queryParams.push(userId);
  paramIndex++;

  // Add filters
  if (quizId) {
    query += ` AND q.quiz_id = $${paramIndex}`;
    queryParams.push(quizId);
    paramIndex++;
  }

  if (grade) {
    query += ` AND q.grade = $${paramIndex}`;
    queryParams.push(grade);
    paramIndex++;
  }

  if (subject) {
    query += ` AND q.subject = $${paramIndex}`;
    queryParams.push(subject);
    paramIndex++;
  }

  if (minScore) {
    query += ` AND qs.obtained_score >= $${paramIndex}`;
    queryParams.push(minScore);
    paramIndex++;
  }

  if (maxScore) {
    query += ` AND qs.obtained_score <= $${paramIndex}`;
    queryParams.push(maxScore);
    paramIndex++;
  }

  if (from) {
    const fromDate = new Date(from);
    if (isNaN(fromDate.getTime())) {
      throw new Error("Invalid 'from' date format. Use DD/MM/YYYY format.");
    }
    query += ` AND qs.submitted_at >= $${paramIndex}`;
    queryParams.push(fromDate);
    paramIndex++;
  }

  if (to) {
    const toDate = new Date(to);
    if (isNaN(toDate.getTime())) {
      throw new Error("Invalid 'to' date format. Use DD/MM/YYYY format.");
    }
    toDate.setDate(toDate.getDate() + 1);
    query += ` AND qs.submitted_at < $${paramIndex}`;
    queryParams.push(toDate);
    paramIndex++;
  }

  // Group by necessary fields
  query += `
    GROUP BY 
      qs.id, qs.submission_id, qs.quiz_id, q.subject, 
      q.grade, q.difficulty, qs.user_id, qs.obtained_score, 
      q.maxScore, qs.suggestion_text, qs.submitted_at
    ORDER BY 
      qs.submitted_at DESC
  `;

  const result = await db.query(query, queryParams);
  return result.rows;
};

module.exports = {
  createQuiz,
  createQuestions,
  getQuizById,
  getQuestionHint,
  getQuizWithQuestions,
  saveQuizSubmission,
  getQuizHistory,
}; 