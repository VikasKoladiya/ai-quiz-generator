const db = require("./db");

const createTables = async () => {
  try {
    // Create users table
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        role VARCHAR(50) DEFAULT 'student',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create quizzes table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        quiz_id VARCHAR(255) UNIQUE NOT NULL,
        subject VARCHAR(100) NOT NULL,
        grade INTEGER NOT NULL,
        difficulty VARCHAR(50) NOT NULL,
        totalQuestions DECIMAL(5,2) NOT NULL,
        maxScore DECIMAL(5,2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        created_by INTEGER REFERENCES users(id)
      );
    `);

    // Create questions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        question_id VARCHAR(255) UNIQUE NOT NULL,
        quiz_id INTEGER REFERENCES quizzes(id),
        question TEXT NOT NULL,
        options JSONB NOT NULL,
        correctAnswer VARCHAR(255) NOT NULL,
        score DECIMAL(5,2) NOT NULL,
        hint TEXT
      );
    `);

    // Create quiz_submissions table
    await db.query(`
      CREATE TABLE IF NOT EXISTS quiz_submissions (
        id SERIAL PRIMARY KEY,
        submission_id VARCHAR(255) UNIQUE NOT NULL,
        quiz_id INTEGER REFERENCES quizzes(id),
        user_id INTEGER REFERENCES users(id),
        obtained_score DECIMAL(5,2) NOT NULL,
        suggestion_text TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create submission_responses table
    await db.query(`
      CREATE TABLE IF NOT EXISTS submission_responses (
        id SERIAL PRIMARY KEY,
        submission_id INTEGER REFERENCES quiz_submissions(id),
        question_id VARCHAR(255) NOT NULL,
        correctAnswer VARCHAR(255) NOT NULL,
        user_response VARCHAR(255) NOT NULL,
        is_correct BOOLEAN NOT NULL
      );
    `);

    console.log("Database tables created successfully");
  } catch (error) {
    console.error("Error creating database tables:", error);
    throw error;
  }
};

module.exports = { createTables };
