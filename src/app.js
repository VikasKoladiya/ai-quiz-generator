const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/auth");
const helloRoutes = require("./routes/hello");
const questionRoutes = require("./routes/question");
const quizRoutes = require("./routes/quizRoutes");

// Import database initialization
const { createTables } = require("./config/init-db");

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database tables
createTables();

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", helloRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/quiz", quizRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
