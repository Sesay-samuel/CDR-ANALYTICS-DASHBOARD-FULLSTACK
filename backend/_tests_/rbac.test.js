// -----------------------------------------------------
// Test environment configuration
// -----------------------------------------------------

// Test-only secret.
// Never use a real production JWT secret in test source code.
process.env.JWT_SECRET = "test-jwt-secret-for-automated-testing-only";

const request = require("supertest");
const jwt = require("jsonwebtoken");

// -----------------------------------------------------
// Mock PostgreSQL database
// -----------------------------------------------------

jest.mock("../db", () => ({
  query: jest.fn(),
}));

const pool = require("../db");
const app = require("../server");

// -----------------------------------------------------
// JWT Authentication and RBAC Tests
// -----------------------------------------------------

describe("JWT authentication and RBAC", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---------------------------------------------------
  // Test 1: No JWT
  // ---------------------------------------------------

  test("returns 401 when no JWT is provided", async () => {
    const response = await request(app)
      .get("/api/analytics/summary");

    expect(response.statusCode).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Authentication required",
    });
  });

  // ---------------------------------------------------
  // Test 2: Invalid JWT
  // ---------------------------------------------------

  test("returns 401 when an invalid JWT is provided", async () => {
    const response = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", "Bearer this-is-not-a-valid-jwt");

    expect(response.statusCode).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid or expired token",
    });
  });

  // ---------------------------------------------------
  // Test 3: Analyst can access analytics
  // ---------------------------------------------------

  test("allows an analyst to access analytics summary", async () => {
    // Create a valid JWT for analyst user ID 2.
    const token = jwt.sign(
      { sub: "2" },
      process.env.JWT_SECRET,
      {
        algorithm: "HS256",
        expiresIn: "1h",
      }
    );

    // Database call 1:
    // requireAuth() looks up the authenticated user.
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 2,
          role: "analyst",
        },
      ],
    });

    // Database call 2:
    // /api/analytics/summary gets the overall statistics.
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          totalCalls: 100,
          totalDuration: "5000",
          incomingCalls: 60,
          outgoingCalls: 40,
        },
      ],
    });

    // Database call 3:
    // /api/analytics/summary gets the top callers.
    pool.query.mockResolvedValueOnce({
      rows: [
        {
          callerNumber: "07123456789",
          totalCalls: 20,
        },
      ],
    });

    // Send the valid JWT to the protected endpoint.
    const response = await request(app)
      .get("/api/analytics/summary")
      .set("Authorization", `Bearer ${token}`);

    // Analyst should be authorized.
    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);

    // Verify the analytics response.
    expect(response.body.analytics).toEqual({
      totalCalls: 100,
      totalDuration: 5000,

      callTypeDistribution: {
        incoming: 60,
        outgoing: 40,
      },

      topCallers: [
        {
          callerNumber: "07123456789",
          totalCalls: 20,
        },
      ],
    });
  });

  // ---------------------------------------------------
  // Test 4: Analyst cannot access admin-only CDR data
  // ---------------------------------------------------

  test(
    "returns 403 when an analyst tries to access admin-only CDR data",
    async () => {
      // Create a valid JWT for analyst user ID 2.
      const token = jwt.sign(
        { sub: "2" },
        process.env.JWT_SECRET,
        {
          algorithm: "HS256",
          expiresIn: "1h",
        }
      );

      // requireAuth() looks up the authenticated user.
      // The database identifies this user as an analyst.
      pool.query.mockResolvedValueOnce({
        rows: [
          {
            id: 2,
            role: "analyst",
          },
        ],
      });

      // Analyst attempts to access the admin-only endpoint.
      const response = await request(app)
        .get("/api/cdr")
        .set("Authorization", `Bearer ${token}`);

      // RBAC must deny access.
      expect(response.statusCode).toBe(403);

      // Verify the actual response returned by server.js.
      expect(response.body).toEqual({
        success: false,
        message: "You do not have permission to access this resource",
      });
    }
  );
                                 // ---------------------------------------------------
// Test 5: Admin can access admin-only CDR data
// ---------------------------------------------------

test("allows an admin to access admin-only CDR data", async () => {
  // Create a valid JWT for admin user ID 1.
  const token = jwt.sign(
    { sub: "1" },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      expiresIn: "1h",
    }
  );

  // Database call 1:
  // requireAuth() looks up the authenticated user.
  pool.query.mockResolvedValueOnce({
    rows: [
      {
        id: 1,
        role: "admin",
      },
    ],
  });

  // Database call 2:
  // /api/cdr retrieves the CDR records.
  pool.query.mockResolvedValueOnce({
    rows: [
      {
        id: 1001,
        callerNumber: "07123456789",
        receiverNumber: "07987654321",
        callStatus: true,
        city: "London",
      },
    ],
  });

  // Admin attempts to access the admin-only CDR endpoint.
  const response = await request(app)
    .get("/api/cdr")
    .set("Authorization", `Bearer ${token}`);

  // RBAC should allow the admin through.
  expect(response.statusCode).toBe(200);

  // Confirm that the endpoint returned a response body.
  expect(response.body).toBeDefined();
});
});