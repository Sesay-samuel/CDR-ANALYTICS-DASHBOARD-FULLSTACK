
const pool = require("./db");

async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cdr_records (
        id VARCHAR(50) PRIMARY KEY,
        caller_name VARCHAR(255),
        caller_number VARCHAR(50),
        receiver_number VARCHAR(50),
        city VARCHAR(255),
        call_direction BOOLEAN,
        call_status BOOLEAN,
        call_duration INTEGER,
        call_cost NUMERIC(12, 2),
        call_start_time TIMESTAMPTZ,
        call_end_time TIMESTAMPTZ
      );
    `);

    console.log("CDR records table created successfully!");
  } catch (error) {
    console.error("Failed to create CDR table:", error.message);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

createTable();