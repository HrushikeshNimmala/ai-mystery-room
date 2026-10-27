
const express = require("express");
const cors = require("cors");

const app = express();

// Allow requests from our React frontend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
  })
);

// Parse incoming JSON requests
app.use(express.json());
const caseRoutes = require("./routes/caseRoutes");

app.use("/api/cases", caseRoutes);

// Basic welcome route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "AI Mystery Room API is running!",
  });
});

// Health-check API
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is healthy",
    timestamp: new Date().toISOString(),
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

module.exports = app;
