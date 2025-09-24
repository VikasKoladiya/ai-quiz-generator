# Express Authentication Service

A Node.js Express application with PostgreSQL database that provides authentication endpoints and AI-powered quiz generation.

## Features

- User signup and login endpoints
- JWT authentication via HTTP cookies
- PostgreSQL database integration
- Protected Hello World endpoint to test authentication
- Question generation using Azure OpenAI API
- Quiz questions with helpful hints
- Quiz submission and evaluation
- Quiz history tracking

## Setup Instructions

### Prerequisites

- Node.js
- PostgreSQL installed and running

### Environment Setup

1. Clone this repository
2. Install dependencies: `npm install`
3. Set up your PostgreSQL database (e.g. on Neon.tech or any other provider)
4. Create the database tables using the schema in `database/schema.sql`
5. Update the database connection string in the `.env` file
6. Run database migrations (if upgrading): `npm run migrate`

### Run the Application

- Development mode: `npm run dev`
- Production mode: `npm start`
- Run migrations: `npm run migrate`

## Documentation

- [API Documentation](docs/API_DOCS.md) - Detailed API endpoints documentation
- [Database Schema](database/schema.sql) - SQL schema for database tables
- [Postman Collection](docs/PlayPower_API.postman_collection.json) - Import this collection into Postman to test all API endpoints

### Using the Postman Collection

1. Download and install [Postman](https://www.postman.com/downloads/) if you haven't already
2. Import the `PlayPower_API.postman_collection.json` file into Postman
3. Set up your environment variables in Postman:
   - `base_url`: Your API base URL (e.g., `https://playpower-app.gentleglacier-3f2b9a90.centralindia.azurecontainerapps.io/`)
   - `jwt_token`: Will be automatically set after successful login
4. The collection includes:
   - Authentication endpoints (signup, login)
   - Question management endpoints
   - Quiz management endpoints
   - Pre-configured request bodies and headers
   - Environment variables for easy testing

## API Endpoints

### Authentication

- **POST /api/auth/signup** - Create a new user account
- **POST /api/auth/login** - Login with username/password and receive JWT token

### Protected Routes

- **GET /api/hello** - Protected Hello World endpoint (requires authentication)

### Question Management

- **POST /api/questions/generate-questions** - Generate educational questions with hints using Azure OpenAI (requires authentication)
- **GET /api/questions/quiz/:quizId** - Get a specific quiz by ID (requires authentication)
- **GET /api/questions/hint/:questionId** - Get a hint for a specific question (requires authentication)

### Quiz Management

- **POST /api/quiz/submit** - Submit quiz answers (requires authentication)
- **GET /api/quiz/history** - Get quiz history with filters (requires authentication)

## Environment Variables (.env)

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/quiz_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1h

# Azure OpenAI Configuration
AZURE_OPENAI_ENDPOINT=your_azure_openai_endpoint
AZURE_OPENAI_API_KEY=your_azure_openai_api_key
AZURE_OPENAI_API_VERSION=2024-02-15-preview
AZURE_OPENAI_DEPLOYMENT_NAME=your_deployment_name
```

Note: Replace the placeholder values with your actual configuration values. The `DATABASE_URL` should be updated with your PostgreSQL connection details.
