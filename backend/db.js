const path = require("node:path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const {
  NEON_DATABASE_URL,
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
} = process.env;

let pool;

if (NEON_DATABASE_URL) {
  console.log("Database mode: hosted PostgreSQL");

  pool = new Pool({
    connectionString: NEON_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false,
    },
  });
} else {
  console.log("Database mode: local PostgreSQL");

  pool = new Pool({
    host: DB_HOST,
    port: Number(DB_PORT || 5432),
    database: DB_NAME,
    user: DB_USER,
    password: DB_PASSWORD,
  });
}

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error.message);
});

module.exports = pool;