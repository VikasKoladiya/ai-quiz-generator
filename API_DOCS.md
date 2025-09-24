# PlayPower API Documentation

## API Overview

### Authentication APIs
1. Signup - Create a new user account
2. Login - Authenticate user and get JWT token

### Quiz Management APIs
1. Generate Questions - Create a new quiz with AI-generated questions
2. Get Quiz by ID - Retrieve a specific quiz with its questions
3. Get Question Hint - Get hint for a specific question
4. Submit Quiz - Submit answers for a quiz
5. Get Quiz History - Get user's quiz submission history

### Protected Routes
1. Hello World - Test authentication endpoint

## Detailed API Documentation

### 1. Signup API
**Endpoint:** `POST /api/auth/signup`

**Description:** Creates a new user account in the system.

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123",
  "email": "test@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully"
}
```

**Error Responses:**
```json
{
  "success": false,
  "message": "Username already exists"
}
```
```json
{
  "success": false,
  "message": "Email already exists"
}
```

### 2. Login API
**Endpoint:** `POST /api/auth/login`

**Description:** Authenticates user and returns JWT token for subsequent requests.

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-uuid",
    "username": "testuser",
    "email": "test@example.com"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Invalid credentials"
}
```

### 3. Generate Questions API
**Endpoint:** `POST /api/questions/generate-questions`

**Description:** Generates a new quiz with AI-generated questions based on specified parameters.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "grade": 5,
  "Subject": "Maths",
  "TotalQuestions": 10,
  "MaxScore": 10,
  "Difficulty": "EASY"
}
```

**Parameters:**
- `grade` (number): Grade level for questions (1-12)
- `Subject` (string): Subject name (e.g., "Maths", "Science")
- `TotalQuestions` (number): Number of questions to generate
- `MaxScore` (number): Maximum possible score
- `Difficulty` (string): "EASY", "MEDIUM", or "HARD"

**Response:**
```json
{
  "success": true,
  "data": {
    "quizId": "550e8400-e29b-41d4-a716-446655440000",
    "subject": "Maths",
    "grade": 5,
    "difficulty": "EASY",
    "totalQuestions": 10,
    "maxScore": 10,
    "questions": [
      {
        "question": "What is 5 + 7?",
        "options": ["10", "12", "15", "17"],
        "correctAnswer": "12",
        "score": 1,
        "hint": "Think about counting 7 steps after reaching 5."
      }
    ]
  }
}
```

### 4. Get Quiz by ID API
**Endpoint:** `GET /api/questions/quiz/:quizId`

**Description:** Retrieves a specific quiz with all its questions.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `quizId` (string): UUID of the quiz

**Response:**
```json
{
  "success": true,
  "data": {
    "quizId": "550e8400-e29b-41d4-a716-446655440000",
    "subject": "Maths",
    "grade": 5,
    "difficulty": "EASY",
    "totalQuestions": 10,
    "maxScore": 10,
    "createdAt": "2023-10-25T12:00:00.000Z",
    "questions": [
      {
        "id": 1,
        "questionId": "7b1e7f4c-97c5-4a4a-8d5e-ab7d1f8bdd82",
        "question": "What is 5 + 7?",
        "options": ["10", "12", "15", "17"],
        "correctAnswer": "B",
        "score": 1,
        "hint": "Think about counting 7 steps after reaching 5."
      }
    ]
  }
}
```

### 5. Get Question Hint API
**Endpoint:** `GET /api/questions/quiz/:quizId/question/:questionId/hint`

**Description:** Retrieves a hint for a specific question in a quiz.

**Authentication:** Required (JWT Token)

**Path Parameters:**
- `quizId` (string): UUID of the quiz
- `questionId` (string): UUID of the question

**Response:**
```json
{
  "success": true,
  "data": {
    "hint": "Think about counting 7 steps after reaching 5."
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Question not found or does not belong to the specified quiz"
}
```

### 6. Submit Quiz API
**Endpoint:** `POST /api/quiz/submit`

**Description:** Submits answers for a quiz and calculates the score.

**Authentication:** Required (JWT Token)

**Request Body:**
```json
{
  "quizId": "550e8400-e29b-41d4-a716-446655440000",
  "responses": [
    {
      "questionId": "7b1e7f4c-97c5-4a4a-8d5e-ab7d1f8bdd82",
      "userResponse": "B"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "submissionId": "submission-uuid",
    "quizId": "550e8400-e29b-41d4-a716-446655440000",
    "obtainedScore": 8,
    "maxScore": 10,
    "percentageScore": 80,
    "suggestionText": "Good job! You can improve in algebra questions."
  }
}
```

### 7. Get Quiz History API
**Endpoint:** `GET /api/quiz/history`

**Description:** Retrieves user's quiz submission history with optional filters.

GET `/api/questions/quiz/:quizId/question/:questionId/hint`

**Query Parameters:**
- `quizId` (string, optional): Filter by specific quiz ID
- `grade` (number, optional): Filter by grade level
- `subject` (string, optional): Filter by subject
- `minScore` (number, optional): Filter by minimum score
- `maxScore` (number, optional): Filter by maximum score
- `from` (string, optional): Filter by start date (DD/MM/YYYY)
- `to` (string, optional): Filter by end date (DD/MM/YYYY)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "submissionId": "submission-uuid",
      "quizId": "550e8400-e29b-41d4-a716-446655440000",
      "subject": "Maths",
      "grade": 5,
      "difficulty": "EASY",
      "obtainedScore": 8,
      "maxPossibleScore": 10,
      "percentageScore": 80,
      "suggestionText": "Good job! You can improve in algebra questions.",
      "submittedAt": "2023-10-25T12:00:00.000Z"
    }
  ]
}
```

### 8. Hello World API
**Endpoint:** `GET /api/hello`

**Description:** Protected endpoint to test authentication.

**Authentication:** Required (JWT Token)

**Response:**
```json
{
  "success": true,
  "message": "Hello, authenticated user!"
}
```

## Common Error Responses

All endpoints may return the following error responses:

### Authentication Error
```json
{
  "success": false,
  "message": "Authentication required"
}
```

### Invalid Request
```json
{
  "success": false,
  "message": "Invalid request parameters"
}
```

### Not Found
```json
{
  "success": false,
  "message": "Resource not found"
}
```

### Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## Postman Collection

A Postman collection is available at `docs/Ai-Quiz.postman_collection.json`. This collection contains all the necessary endpoints for testing the PlayPower Quiz API.

### Collection Details
- **Collection Name:** Ai-Quiz
- **Collection ID:** 56433afe-57f7-44f7-86b6-0cc7a41d1e4e
- **Base URLs:**
  - Local Development: `http://localhost:3000`
  - Production: `https://playpower-app.gentleglacier-3f2b9a90.centralindia.azurecontainerapps.io`

### Available Requests

1. **SignupUser**
   - Method: POST
   - Endpoint: `/api/auth/signup`
   - Headers: Content-Type: application/json
   - Body: 
     ```json
     {
       "username": "testuser2",
       "password": "password123"
     }
     ```

2. **LoginUser**
   - Method: POST
   - Endpoint: `/api/auth/login`
   - Headers: Content-Type: application/json
   - Body:
     ```json
     {
       "username": "testuser",
       "password": "password123"
     }
     ```

3. **Hello**
   - Method: GET
   - Endpoint: `/api/hello`
   - Headers: Cookie: cookies.txt

4. **Generate Questions**
   - Method: POST
   - Endpoint: `/api/questions/generate-questions`
   - Headers: 
     - Content-Type: application/json
     - Cookie: cookies.txt
   - Body:
     ```json
     {
       "grade": 5,
       "Subject": "maths",
       "TotalQuestions": 2,
       "MaxScore": 10,
       "Difficulty": "EASY"
     }
     ```

5. **GetQuiz**
   - Method: GET
   - Endpoint: `/api/questions/quiz/:quizId`
   - Example: `/api/questions/quiz/b138e352-ccdf-4f74-9896-f5ea5800af83`

6. **SubmitQuiz**
   - Method: POST
   - Endpoint: `/api/quiz/submit`
   - Headers: Content-Type: application/json
   - Body:
     ```json
     {
       "quizId": "afa0143f-a0c0-428e-885d-32c70194feac",
       "responses": [
         {
           "questionId": "5b77359f-0611-4927-8548-e2bd8c4a1ef0",
           "userResponse": "D"
         },
         {
           "questionId": "cb4337e4-e98e-4488-acb3-b5f58eda1e1a",
           "userResponse": "A"
         }
       ]
     }
     ```

7. **QuizHistory**
   - Method: GET
   - Endpoint: `/api/quiz/history`
   - Query Parameters: minScore=2

8. **QuestionHint**
   - Method: GET
   - Endpoint: `/api/questions/:questionId/hint`
   - Example: `/api/questions/5b77359f-0611-4927-8548-e2bd8c4a1ef0/hint`

### Using the Collection

1. Import the collection into Postman:
   - Click "Import" in Postman
   - Select the `docs/Ai-Quiz.postman_collection.json` file

2. Set up the environment:
   - Create a new environment in Postman
   - Add the following variables:
     - `base_url_local`: http://localhost:3000
     - `base_url_prod`: https://playpower-app.gentleglacier-3f2b9a90.centralindia.azurecontainerapps.io
     - `cookies.txt`: Your authentication cookie after login

3. Authentication Flow:
   - First, use the "SignupUser" request to create a new account
   - Then, use the "LoginUser" request to get authentication
   - The cookie will be automatically used in subsequent requests

4. Testing the API:
   - All requests are pre-configured with the correct headers and body formats
   - Example values are provided for all parameters
   - The collection includes all necessary endpoints for the complete quiz workflow
   - You can switch between local and production environments by changing the base URL variable

Note: Make sure your local server is running on port 3000 when testing locally, or use the production URL for testing against the hosted environment.
