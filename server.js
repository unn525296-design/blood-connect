const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/database");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Mount routers
app.use("/api/auth", require("./routes/auth"));
app.use("/api/donors", require("./routes/donors"));
app.use("/api/hospitals", require("./routes/hospitals"));
app.use("/api/reviews", require("./routes/reviews"));
app.use("/api/admin", require("./routes/admin"));

// Home route
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Blood Connect API",
    version: "1.0.0",
  });
});

// Handle undefined routes
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`
  );
  console.log(`📚 API Documentation: http://localhost:${PORT}/`);
});
