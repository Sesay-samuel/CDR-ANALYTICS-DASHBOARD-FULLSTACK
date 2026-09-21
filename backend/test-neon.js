const path = require("node:path");
const dotenv = require("dotenv");
const { Client } = require("pg");

dotenv.config({
  path: path.join(__dirname, ".env.neon"),
});

async function testNeonConnection() {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    console.error("NEON_DATABASE_URL is missing from .env.neon");
    process.exitCode = 1;
    return;
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: true },
    connectionTimeoutMillis: 10000,
  });

  try {
    await client.connect();

    const result = await client.query(`
      SELECT
        current_database() AS database_name,
        COUNT(*)::INTEGER AS cdr_count
      FROM cdr_records
    `);

    console.log("Neon connection successful!");
    console.log("Database:", result.rows[0].database_name);
    console.log("CDR records:", result.rows[0].cdr_count);
  } catch (error) {
    console.error("Neon connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

testNeonConnection();