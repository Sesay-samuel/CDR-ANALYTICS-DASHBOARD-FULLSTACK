const { app } = require("@azure/functions");

/**
 * Azure Function: cdrAnalytics
 *
 * Accepts an array of Call Detail Records (CDRs) and calculates
 * summary analytics.
 *
 * POST /api/cdrAnalytics
 *
 * Request body:
 * {
 *   "records": [
 *     {
 *       "duration": 120,
 *       "status": "completed"
 *     }
 *   ]
 * }
 */
app.http("cdrAnalytics", {
  methods: ["POST"],
  authLevel: "function",

  handler: async (request, context) => {
    context.log("CDR Analytics Azure Function invoked.");

    try {
      const body = await request.json();

      if (!body || !Array.isArray(body.records)) {
        return {
          status: 400,
          jsonBody: {
            success: false,
            message: "Request body must contain a records array.",
          },
        };
      }

      const records = body.records;

      if (records.length === 0) {
        return {
          status: 200,
          jsonBody: {
            success: true,
            analytics: {
              totalCalls: 0,
              totalDuration: 0,
              averageDuration: 0,
              completedCalls: 0,
              failedCalls: 0,
            },
          },
        };
      }

      let totalDuration = 0;
      let completedCalls = 0;
      let failedCalls = 0;

      for (const record of records) {
        const duration = Number(record.duration);

        if (Number.isFinite(duration) && duration >= 0) {
          totalDuration += duration;
        }

        const status = String(record.status || "").toLowerCase();

        if (status === "completed") {
          completedCalls++;
        }

        if (status === "failed") {
          failedCalls++;
        }
      }

      const averageDuration = totalDuration / records.length;

      return {
        status: 200,
        jsonBody: {
          success: true,
          analytics: {
            totalCalls: records.length,
            totalDuration,
            averageDuration: Number(averageDuration.toFixed(2)),
            completedCalls,
            failedCalls,
          },
        },
      };
    } catch (error) {
      context.error("CDR analytics processing failed:", error);

      return {
        status: 400,
        jsonBody: {
          success: false,
          message: "Invalid JSON request body.",
        },
      };
    }
  },
});