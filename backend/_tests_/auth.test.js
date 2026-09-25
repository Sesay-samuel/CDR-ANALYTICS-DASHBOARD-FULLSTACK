// Test-only JWT secret.
// Never use a real production secret in automated test source code.
process.env.JWT_SECRET = "test-jwt-secret-for-automated-testing-only";

const request = require("supertest");
const bcrypt = require("bcryptjs");

jest.mock("../db", () => ({
  query: jest.fn(),
}));

const pool = require("../db");
const app = require("../server");

describe("POST /api/login", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 200 and a JWT for valid credentials", async () => {
    const password = "SecureTestPassword123!";
    const passwordHash = await bcrypt.hash(password, 10);

    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          email: "admin@test.com",
          password_hash: passwordHash,
          role: "admin",
        },
      ],
    });

    const response = await request(app)
      .post("/api/login")
      .send({
        email: "admin@test.com",
        password,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.token).toBeDefined();

    expect(response.body.user).toMatchObject({
      email: "admin@test.com",
      role: "admin",
    });
  });

    test("returns 401 when the password is incorrect", async () => {
    const realPassword = "CorrectPassword123!";
    const passwordHash = await bcrypt.hash(realPassword, 10);

    pool.query.mockResolvedValueOnce({
      rows: [
        {
          id: 1,
          email: "admin@test.com",
          password_hash: passwordHash,
          role: "admin",
        },
      ],
    });

    const response = await request(app)
      .post("/api/login")
      .send({
        email: "admin@test.com",
        password: "WrongPassword123!",
      });

    expect(response.statusCode).toBe(401);

    expect(response.body).toEqual({
      success: false,
      message: "Invalid email or password",
    });
  });
  test("returns 401 when the user does not exist", async () => {
  pool.query.mockResolvedValueOnce({
    rows: [],
  });

  const response = await request(app)
    .post("/api/login")
    .send({
      email: "unknown@test.com",
      password: "SomePassword123!",
    });

  expect(response.statusCode).toBe(401);

  expect(response.body).toEqual({
    success: false,
    message: "Invalid email or password",
  });
});

  test("returns 400 when email or password is missing", async () => {
  const response = await request(app)
    .post("/api/login")
    .send({
      email: "admin@test.com",
    });

  expect(response.statusCode).toBe(400);
  expect(response.body.success).toBe(false);
});
});