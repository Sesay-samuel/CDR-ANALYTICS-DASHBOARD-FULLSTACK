
const pool = require("./db");

async function testConnection() {
  try {
    const result = await pool.query(
      "SELECT current_database() AS database_name, NOW() AS server_time"
    );

    console.log("PostgreSQL connection successful!");
    console.log("Database:", result.rows[0].database_name);
    console.log("Server time:", result.rows[0].server_time);
  } catch (error) {
    console.error("PostgreSQL connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

testConnection();