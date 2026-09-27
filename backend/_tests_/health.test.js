const request = require("supertest");

jest.mock("../db", () => ({
  query: jest.fn(),
}));

const pool = require("../db");
const app = require("../server");

describe("GET /api/health", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
    test("returns 503 when the database is unavailable", async () => {
    pool.query.mockRejectedValueOnce(
    new Error("Database connection failed")
  );

  const response = await request(app).get("/api/health");

  expect(response.statusCode).toBe(503);

  expect(response.body).toEqual({
    success: false,
    status: "unhealthy",
    database: "disconnected",
    message: "Database connection unavailable",
  });

  expect(pool.query).toHaveBeenCalledWith("SELECT 1");
});

  test("returns 200 when the database is connected", async () => {
    pool.query.mockResolvedValueOnce({ rows: [{ "?column?": 1 }] });

    const response = await request(app).get("/api/health");

    expect(response.statusCode).toBe(200);

    expect(response.body).toEqual({
      success: true,
      status: "healthy",
      database: "connected",
      message: "CDR Analytics Backend is running",
    });

    expect(pool.query).toHaveBeenCalledWith("SELECT 1");
  });
});