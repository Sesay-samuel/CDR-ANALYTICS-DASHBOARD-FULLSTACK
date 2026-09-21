
const path = require("node:path");
const { Pool } = require("pg");
const dotenv = require("dotenv");

// Keep the existing local database configuration.
dotenv.config({
  path: path.join(__dirname, ".env"),
});

// Load the Neon connection string when running locally.
// In Vercel, environment variables are configured in the project settings.
if (!process.env.NEON_DATABASE_URL) {
  dotenv.config({
    path: path.join(__dirname, ".env.neon"),
  });
}

const neonUrl = process.env.NEON_DATABASE_URL;

const pool = neonUrl
  ? new Pool({
      connectionString: neonUrl,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT || 5432),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

module.exports = pool;