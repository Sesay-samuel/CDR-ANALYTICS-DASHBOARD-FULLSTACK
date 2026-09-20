
const cors = require("cors");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 4000;

// Allow requests from the local React frontend
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

// Allow the server to read JSON requests
app.use(express.json());

// Health-check endpoint
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "CDR Analytics Backend is running",
  });
});

// Temporary sample CDR records for backend testing
const cdrRecords = [
  {
    id: "1",
    callerName: "John Smith",
    callerNumber: "+447700900123",
    receiverNumber: "+447700900456",
    city: "London",
    callDuration: 120,
    callCost: 1.5,
    callStatus: true,
    callDirection: "Outgoing",
    callStartTime: "2026-09-19T10:00:00Z",
    callEndTime: "2026-09-19T10:02:00Z",
  },
  {
    id: "2",
    callerName: "Jane Brown",
    callerNumber: "+447700900789",
    receiverNumber: "+447700900111",
    city: "Manchester",
    callDuration: 45,
    callCost: 0.5,
    callStatus: false,
    callDirection: "Incoming",
    callStartTime: "2026-09-19T11:00:00Z",
    callEndTime: "2026-09-19T11:00:45Z",
  },
];

// Return all CDR records
app.get("/api/cdr", (req, res) => {
  res.status(200).json(cdrRecords);
});

// Start the server only when this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Backend running at http://localhost:${PORT}`);
  });
}

// Export the Express app for deployment
module.exports = app;