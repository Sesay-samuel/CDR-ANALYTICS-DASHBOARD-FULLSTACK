
const path = require("node:path");
const XLSX = require("xlsx");
const pool = require("./db");

const filePath = path.join(
  __dirname,
  "data",
  "mock_call_records_10000.xlsx"
);

const BATCH_SIZE = 500;

async function importCDR() {
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets["Calls"];

  if (!sheet) {
    throw new Error('Excel sheet "Calls" was not found');
  }

  const records = XLSX.utils.sheet_to_json(sheet, {
    defval: null,
  });

  console.log(`Found ${records.length} Excel records.`);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    for (let start = 0; start < records.length; start += BATCH_SIZE) {
      const batch = records.slice(start, start + BATCH_SIZE);
      const values = [];
      const placeholders = [];

      batch.forEach((record, index) => {
        const offset = index * 11;

        placeholders.push(
          `(${Array.from(
            { length: 11 },
            (_, i) => `$${offset + i + 1}`
          ).join(", ")})`
        );

        values.push(
          String(record.id),
          record.callerName,
          record.callerNumber,
          record.receiverNumber,
          record.city,
          record.callDirection,
          record.callStatus,
          record.callDuration,
          record.callCost,
          record.callStartTime,
          record.callEndTime
        );
      });

      const query = `
        INSERT INTO cdr_records (
          id,
          caller_name,
          caller_number,
          receiver_number,
          city,
          call_direction,
          call_status,
          call_duration,
          call_cost,
          call_start_time,
          call_end_time
        )
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

      console.log(
        `Processed ${Math.min(start + BATCH_SIZE, records.length)} / ${records.length}`
      );
    }

    await client.query("COMMIT");

    console.log("CDR import completed successfully!");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

importCDR()
  .catch((error) => {
    console.error("CDR import failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });