
const fs = require("node:fs");
const path = require("node:path");
const dotenv = require("dotenv");
const { Client } = require("pg");
const { parse } = require("csv-parse/sync");

dotenv.config({ path: path.join(__dirname, ".env.neon") });

const BATCH_SIZE = 250;

async function importToNeon() {
  const connectionString = process.env.NEON_DATABASE_URL;

  if (!connectionString) {
    console.error("NEON_DATABASE_URL is missing from .env.neon");
    process.exitCode = 1;
    return;
  }

  const csvPath = path.join(__dirname, "cdr-records-export.csv");

  if (!fs.existsSync(csvPath)) {
    console.error("CSV file not found:", csvPath);
    process.exitCode = 1;
    return;
  }

  const records = parse(fs.readFileSync(csvPath, "utf8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  });

  console.log(`CSV records found: ${records.length}`);

  const columns = [
    "id",
    "caller_name",
    "caller_number",
    "receiver_number",
    "city",
    "call_direction",
    "call_status",
    "call_duration",
    "call_cost",
    "call_start_time",
    "call_end_time",
  ];

  const client = new Client({ connectionString });
  let connected = false;

  try {
    await client.connect();
    connected = true;
    console.log("Connected to Neon.");

    await client.query("BEGIN");

    for (let start = 0; start < records.length; start += BATCH_SIZE) {
      const batch = records.slice(start, start + BATCH_SIZE);
      const values = [];

      const placeholders = batch.map((record, rowIndex) => {
        const rowValues = columns.map((column) => {
          const value = record[column];
          return value === "" || value === undefined ? null : value;
        });

        values.push(...rowValues);

        const offset = rowIndex * columns.length;

        return `(${columns
          .map((_, columnIndex) => `$${offset + columnIndex + 1}`)
          .join(", ")})`;
      });

      const query = `
        INSERT INTO cdr_records (${columns.join(", ")})
        VALUES ${placeholders.join(", ")}
        ON CONFLICT (id) DO UPDATE SET
          caller_name = EXCLUDED.caller_name,
          caller_number = EXCLUDED.caller_number,
          receiver_number = EXCLUDED.receiver_number,
          city = EXCLUDED.city,
          call_direction = EXCLUDED.call_direction,
          call_status = EXCLUDED.call_status,
          call_duration = EXCLUDED.call_duration,
          call_cost = EXCLUDED.call_cost,
          call_start_time = EXCLUDED.call_start_time,
          call_end_time = EXCLUDED.call_end_time
      `;

      await client.query(query, values);
      console.log(`Processed ${Math.min(start + BATCH_SIZE, records.length)} / ${records.length}`);
    }

    await client.query("COMMIT");

    const result = await client.query(
      "SELECT COUNT(*) AS total FROM cdr_records"
    );

    console.log("Import completed successfully!");
    console.log("Total Neon CDR records:", result.rows[0].total);
  } catch (error) {
    if (connected) {
      await client.query("ROLLBACK").catch(() => {});
    }

    console.error("Import failed:", error.message);
    process.exitCode = 1;
  } finally {
    if (connected) {
      await client.end();
    }
  }
}

importToNeon();