const bcrypt = require("bcryptjs");
const pool = require("./db");

async function createUser() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("ADMIN_EMAIL and ADMIN_PASSWORD must be set.");
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
      `INSERT INTO users (email, password_hash)
       VALUES ($1, $2)`,
      [email.trim().toLowerCase(), passwordHash]
    );

    console.log("User created successfully.");
  } catch (error) {
    if (error.code === "23505") {
      console.error("A user with this email already exists.");
    } else {
      console.error("Failed to create user:", error.message);
    }
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

createUser();