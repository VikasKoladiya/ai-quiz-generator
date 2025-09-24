-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create quizzes table
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

-- Create questions table
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

-- Create quiz_submissions table
CREATE TABLE IF NOT EXISTS quiz_submissions (
    id SERIAL PRIMARY KEY,
    submission_id VARCHAR(255) UNIQUE NOT NULL,
    quiz_id INTEGER REFERENCES quizzes(id),
    user_id INTEGER REFERENCES users(id),
    obtained_score DECIMAL(5,2) NOT NULL,
    suggestion_text TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create submission_responses table
CREATE TABLE IF NOT EXISTS submission_responses (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES quiz_submissions(id),
    question_id VARCHAR(255) NOT NULL,
    correctAnswer VARCHAR(255) NOT NULL,
    user_response VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL
);

-- Create user_answers table
CREATE TABLE IF NOT EXISTS user_answers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    question_id INTEGER REFERENCES questions(id),
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    quiz_id INTEGER REFERENCES quizzes(id),
    score DECIMAL(5,2) NOT NULL,
    total_questions DECIMAL(5,2) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_quizzes_user_id ON quizzes(user_id);
CREATE INDEX IF NOT EXISTS idx_questions_quiz_id ON questions(quiz_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON user_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_id ON quiz_attempts(quiz_id); 