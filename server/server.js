require("dotenv").config();
const express = require("express");
const helmet = require("helmet");            // NEW: loads the Helmet library
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");
const passport = require("./config/passport");
const { apiLimiter } = require("./middleware/rateLimiters");
const { sanitizeBody } = require("./middleware/sanitize");

const app = express();
app.use(helmet());                           // NEW: adds the security headers to every reply
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(apiLimiter);
app.use(express.json({ limit: "10kb" }));
app.use(sanitizeBody);
app.use(cookieParser());
app.use(passport.initialize());

app.get("/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", require("./routes/authRoutes"));

const PORT = process.env.PORT || 5000;
connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch((err) => console.error("DB connection failed:", err.message));