
const cors = require("cors");
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 4000;

// -----------------------------------------------------
// Middleware
// -----------------------------------------------------

// Allow requests from the local React frontend.
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Allow the server to read JSON requests.
app.use(express.json());

// -----------------------------------------------------
// Public: Health check
// -----------------------------------------------------

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "CDR Analytics Backend is running",
  });
});

// -----------------------------------------------------
// Public: Login
// -----------------------------------------------------

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

// -----------------------------------------------------
// Middleware: Verify JWT
// -----------------------------------------------------

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

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
}

// -----------------------------------------------------
// Protected: Fetch all CDR records
// -----------------------------------------------------

// Keep this endpoint unchanged for the existing React dashboard.

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

    return res.status(200).json(result.rows);
  } catch (error) {
    console.error("Failed to fetch CDR records:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch CDR records",
    });
  }
});

// -----------------------------------------------------
// Protected: Paginated and filtered CDR records
// -----------------------------------------------------

// Example:
// GET /api/cdr/paginated?page=1&limit=50
//
// Optional filters:
// city
// callerNumber
// receiverNumber
// from (YYYY-MM-DD)
// to (YYYY-MM-DD)

app.get("/api/cdr/paginated", requireAuth, async (req, res) => {
  // Read pagination parameters.
  const page = Number(req.query.page ?? 1);
  const limit = Number(req.query.limit ?? 50);

  // Validate pagination parameters.
  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Page must be a positive integer and limit must be between 1 and 100",
    });
  }

  const offset = (page - 1) * limit;

  if (!Number.isSafeInteger(offset)) {
    return res.status(400).json({
      success: false,
      message: "Requested page is too large",
    });
  }

  // Read optional filter parameters.
  const city = req.query.city;
  const callerNumber = req.query.callerNumber;
  const receiverNumber = req.query.receiverNumber;
  const from = req.query.from;
  const to = req.query.to;

  // Reject invalid filter types and excessively long values.
  const filters = [city, callerNumber, receiverNumber, from, to];

  if (
    filters.some(
      (value) =>
        value !== undefined &&
        (typeof value !== "string" || value.length > 100)
    )
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid filter parameters",
    });
  }

  // Validate date strings in YYYY-MM-DD format.
  function isValidDate(value) {
    if (value === undefined || value === "") {
      return true;
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      return false;
    }

    const date = new Date(`${value}T00:00:00.000Z`);

    return (
      !Number.isNaN(date.getTime()) &&
      date.toISOString().slice(0, 10) === value
    );
  }

  if (
    !isValidDate(from) ||
    !isValidDate(to) ||
    (from && to && from > to)
  ) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid date range. Use YYYY-MM-DD and ensure from is not after to.",
    });
  }

  // Build parameterized SQL filters.
  const conditions = [];
  const values = [];

  if (city?.trim()) {
    values.push(`%${city.trim()}%`);
    conditions.push(`city ILIKE $${values.length}`);
  }

  if (callerNumber?.trim()) {
    values.push(`%${callerNumber.trim()}%`);
    conditions.push(`caller_number ILIKE $${values.length}`);
  }

  if (receiverNumber?.trim()) {
    values.push(`%${receiverNumber.trim()}%`);
    conditions.push(`receiver_number ILIKE $${values.length}`);
  }

  if (from) {
    values.push(from);
    conditions.push(`call_start_time >= $${values.length}::date`);
  }

  if (to) {
    values.push(to);
    conditions.push(
      `call_start_time < ($${values.length}::date + INTERVAL '1 day')`
    );
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  try {
    // Count matching records.
    const countResult = await pool.query(
      `
        SELECT COUNT(*)::INTEGER AS total
        FROM cdr_records
        ${whereClause}
      `,
      values
    );

    const total = countResult.rows[0].total;

    // Fetch only the requested page of matching records.
    const recordsResult = await pool.query(
      `
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
        ${whereClause}
        ORDER BY call_start_time DESC, id
        LIMIT $${values.length + 1}
        OFFSET $${values.length + 2}
      `,
      [...values, limit, offset]
    );

    return res.status(200).json({
      success: true,
      data: recordsResult.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: offset + recordsResult.rows.length < total,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    console.error(
      "Failed to fetch paginated CDR records:",
      error.message
    );

    return res.status(500).json({
      success: false,
      message: "Failed to fetch paginated CDR records",
    });
  }
});

// -----------------------------------------------------
// Protected: Analytics summary
// -----------------------------------------------------

// GET /api/analytics/summary
// Calculate overall statistics and top callers in PostgreSQL.

app.get("/api/analytics/summary", requireAuth, async (req, res) => {
  try {
    const summaryResult = await pool.query(`
      SELECT
        COUNT(*)::INTEGER AS "totalCalls",

        COALESCE(SUM(call_duration), 0)::BIGINT AS "totalDuration",

        COUNT(*) FILTER (
          WHERE call_direction = TRUE
        )::INTEGER AS "incomingCalls",

        COUNT(*) FILTER (
          WHERE call_direction = FALSE
        )::INTEGER AS "outgoingCalls"

      FROM cdr_records
    `);

    const topCallersResult = await pool.query(`
      SELECT
        caller_number AS "callerNumber",
        COUNT(*)::INTEGER AS "totalCalls"

      FROM cdr_records

      GROUP BY caller_number

      ORDER BY "totalCalls" DESC, caller_number ASC

      LIMIT 10
    `);

    const summary = summaryResult.rows[0];

    return res.status(200).json({
      success: true,
      analytics: {
        totalCalls: summary.totalCalls,
        totalDuration: Number(summary.totalDuration),
        callTypeDistribution: {
          incoming: summary.incomingCalls,
          outgoing: summary.outgoingCalls,
        },
        topCallers: topCallersResult.rows,
      },
    });
  } catch (error) {
    console.error("Failed to fetch analytics:", error.message);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch analytics",
    });
  }
});

// -----------------------------------------------------
// Start local backend
// -----------------------------------------------------

// Start the server only when this file is run directly.
// Vercel imports the Express app without starting a listener.

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

// Export the Express app for deployment.
module.exports = app;