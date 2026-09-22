
const bcrypt = require("bcryptjs");
const pool = require("./db");

async function createAnalyst() {
  const email = process.env.ANALYST_EMAIL;
  const password = process.env.ANALYST_PASSWORD;

  if (!email || !password) {
    console.error("ANALYST_EMAIL and ANALYST_PASSWORD must be set.");
    process.exitCode = 1;
    return;
  }

  if (password.length < 12) {
    console.error("Use a password with at least 12 characters.");
    process.exitCode = 1;
    return;
  }

  try {
    const passwordHash = await bcrypt.hash(password, 12);

    await pool.query(
      `INSERT INTO users (email, password_hash, role)
       VALUES ($1, $2, $3)`,
      [email.trim().toLowerCase(), passwordHash, "analyst"]
    );

    console.log("Analyst account created successfully.");
  } catch (error) {
    if (error.code === "23505") {
      console.error("A user with this email already exists.");
    } else {
      console.error("Failed to create Analyst:", error.message);
    }

    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

createAnalyst();