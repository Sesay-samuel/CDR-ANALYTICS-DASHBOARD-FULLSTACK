
const path = require("node:path");
const XLSX = require("xlsx");

const filePath = path.join(
  __dirname,
  "data",
  "mock_call_records_10000.xlsx"
);

const workbook = XLSX.readFile(filePath);

console.log("Sheet names:", workbook.SheetNames);

const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

const records = XLSX.utils.sheet_to_json(firstSheet, {
  defval: null,
});

console.log("Total rows:", records.length);

if (records.length > 0) {
  console.log("Column names:", Object.keys(records[0]));
  console.log("First record:", records[0]);
}