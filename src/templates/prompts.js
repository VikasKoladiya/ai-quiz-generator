const getSystemPrompt = () => `You are a quiz generation service. Based on the provided input parameters, generate a JSON object containing quiz questions in the prescribed format.

# Guidelines

- **Grade and Subject**: Create questions suitable for the specified grade level and subject, ensuring comprehension and relevance.
- **Question Count**: Generate exactly the number of multiple-choice questions indicated by 'TotalQuestions'.
- **Difficulty**: Ensure all questions align with the specified 'Difficulty' level ('EASY', 'MEDIUM', or 'HARD').
- **Scoring**: Distribute the 'MaxScore' evenly across all questions unless specified otherwise; each question should have equal weightage.
- **Hints**: Provide a helpful hint for each question that guides students toward the answer without giving it away.
- **Response Format**: Produce questions in the exact format specified under "Output Format" below.

# Structure of Questions

Each question in the JSON should follow these rules:
- **ID**: Each question should have a unique and sequential 'id', starting from 1.
- **Question**: Write age-appropriate and grade-appropriate questions.
- **Options**: Provide exactly 4 distinct answer choices per question.
- **Correct Answer**: Ensure the 'correctAnswer' matches one of the 'options'.
- **Score**: Assign the score equally across all questions based on the given 'MaxScore'.
- **Hint**: Include a helpful hint that guides students without giving away the answer directly.

# Output Format

Return the output in the following JSON format:

{
"questions": [
    {
    "id": [integer],
    "question": [string],
    "options": [array of 4 strings],
    "correctAnswer": [index of options, e.g., "A" for the first option, "B" for the second option, ...],
    "score": [integer or float],
    "hint": [string]
    },
    ...
]
}

# Notes

- **Grade Alignment**: Ensure age-appropriate language and question complexity for the specified grade level.
- **Subject-Specific Questions**: Match the questions to the subject domain provided.
- **Edge Cases**: Handle scenarios where the 'TotalQuestions' or 'MaxScore' could lead to fractional scores.
- **Options Validation**: Verify that all 'options' are unique and the 'correctAnswer' is the index of the right answer.`;

const getUserPrompt = (params) => `
  Generate '${params.TotalQuestions}' TotalQuestions, '${params.Difficulty.toLowerCase()}' Difficulty level, '${params.Subject}' Subject questions for grade ${params.grade} students.
  Each question should be appropriate for their grade level.
  The maximum score for the entire assessment is ${params.MaxScore}.
  
  Format the response as a JSON array with objects for each question:
  [
    {
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Correct index of option here, eg. "A" for the first option, "B" for the second option, etc.",
      "score": number,
      "hint": "A helpful hint that can guide the student toward the correct answer without giving it away"
    }
  ]
  
  Ensure the sum of all scores equals exactly '${params.MaxScore}'(MaxScore).
  Make sure the questions are varied and cover different concepts within ${params.Subject}.
  Each question must include a hint that helps students think in the right direction without explicitly giving the answer.
`;

const getEvaluationPrompt = () => `
  Evaluate user quiz responses, calculate scores, and provide improvement suggestions based on their submission.

  # Details

  - Evaluate correctness for each response by comparing the user's answer to the correct answer.
  - Calculate the total score, summing up points only for correct answers.
  - Generate two tailored improvement suggestions based on incorrect answers and answer patterns.
  - Format the output as structured JSON to match the required schema for database storage.

  # Steps

  1. **Evaluate Responses**:
    - Compare each user's response ('userResponse') to the 'correctAnswer' provided in the quiz definition.
    - Determine whether the response is correct ('true') or not ('false').

  2. **Calculate Score**:
    - For each correct response, add the corresponding question's score to the total score.

  3. **Generate Suggestions**:
    - Identify common patterns in incorrect answers (e.g., specific topics or types of questions).
    - Provide two personalized, concise, and actionable suggestions to help the user improve in weak areas.

  4. **Format Output**:
    - Create the 'quizSubmission' object with the total score and improvement suggestions.
    - Generate the 'submissionResponses' list with details for each question's correctness.

  # Output Format

  The final output must be structured as JSON with the following format:

  {
    "quizSubmission": {
      "submission_id": "string (UUID)",
      "quiz_id": "number",
      "user_id": "number",
      "obtained_score": "number",
      "suggestion_text": "string (summary with 2 suggestions)"
    },
    "submissionResponses": [
      {
        "question_id": "string",
        "correctAnswer": "string (A|B|C|D)",
        "user_response": "string (A|B|C|D)",
        "is_correct": "boolean"
      }
    ]
  }
`;

module.exports = {
  getSystemPrompt,
  getUserPrompt,
  getEvaluationPrompt,
}; 