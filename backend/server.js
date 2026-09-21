
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// Allow requests from the local React frontend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Allow the server to read JSON requests
app.use(express.json());

// Health-check endpoint (public)
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CDR Analytics Backend is running",
  });
});

// Authenticate a user and issue a JWT (public)
app.post("/api/login", async (req, res) => {
  const email = String(req.body?.email ?? "").trim().toLowerCase();
  const password = req.body?.password;

  if (!email || typeof password !== "string" || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      success: false,
      message: "Login is temporarily unavailable",
    });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, password_hash FROM users WHERE email = $1",
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { sub: String(user.id) },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login failed:", error.message);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
});

// Verify the JWT before allowing access to protected endpoints
function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || "";
  const [scheme, token, extra] = authorization.split(" ");

  if (scheme !== "Bearer" || !token || extra) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET is not configured");

    return res.status(500).json({
      success: false,
      message: "Authentication is temporarily unavailable",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ["HS256"],
    });

    req.user = {
      id: payload.sub,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// Fetch CDR records from PostgreSQL (protected)
app.get("/api/cdr", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        id,
        caller_name AS "callerName",
        caller_number AS "callerNumber",
        receiver_number AS "receiverNumber",
        city,
        call_direction AS "callDirection",
        call_status AS "callStatus",
        call_duration AS "callDuration",
        call_cost::FLOAT AS "callCost",
        call_start_time AS "callStartTime",
        call_end_time AS "callEndTime"
      FROM cdr_records
      ORDER BY call_start_time DESC, id
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    console.error("Failed to fetch CDR records:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch CDR records",
    });
  }
});

// Start the server only when this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

// Export the Express app for deployment
module.exports = app;