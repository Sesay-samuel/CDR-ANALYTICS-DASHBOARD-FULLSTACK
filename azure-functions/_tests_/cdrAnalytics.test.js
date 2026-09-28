// Mock the Azure Functions registration API before loading the function.
jest.mock("@azure/functions", () => ({
  app: {
    http: jest.fn((name, options) => {
      global.__cdrAnalyticsHandler = options.handler;
    }),
  },
}));

// Loading this file registers the function and gives us access
// to its handler through the mock above.
require("../src/functions/cdrAnalytics");

describe("cdrAnalytics Azure Function", () => {
  let handler;
  let context;

  beforeAll(() => {
    handler = global.__cdrAnalyticsHandler;
  });

  beforeEach(() => {
    context = {
      log: jest.fn(),
      error: jest.fn(),
    };
  });

  test("calculates analytics for valid CDR records", async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        records: [
          {
            duration: 120,
            status: "completed",
          },
          {
            duration: 60,
            status: "completed",
          },
          {
            duration: 30,
            status: "failed",
          },
        ],
      }),
    };

    const response = await handler(request, context);

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      success: true,
      analytics: {
        totalCalls: 3,
        totalDuration: 210,
        averageDuration: 70,
        completedCalls: 2,
        failedCalls: 1,
      },
    });

    expect(context.log).toHaveBeenCalledWith(
      "CDR Analytics Azure Function invoked."
    );
  });

  test("returns zero analytics when records array is empty", async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        records: [],
      }),
    };

    const response = await handler(request, context);

    expect(response.status).toBe(200);
    expect(response.jsonBody).toEqual({
      success: true,
      analytics: {
        totalCalls: 0,
        totalDuration: 0,
        averageDuration: 0,
        completedCalls: 0,
        failedCalls: 0,
      },
    });
  });

  test("returns 400 when records is missing", async () => {
    const request = {
      json: jest.fn().mockResolvedValue({}),
    };

    const response = await handler(request, context);

    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      success: false,
      message: "Request body must contain a records array.",
    });
  });

  test("returns 400 when records is not an array", async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        records: "not-an-array",
      }),
    };

    const response = await handler(request, context);

    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      success: false,
      message: "Request body must contain a records array.",
    });
  });

  test("handles invalid durations without crashing", async () => {
    const request = {
      json: jest.fn().mockResolvedValue({
        records: [
          {
            duration: "invalid",
            status: "completed",
          },
          {
            duration: 60,
            status: "failed",
          },
        ],
      }),
    };

    const response = await handler(request, context);

    expect(response.status).toBe(200);
    expect(response.jsonBody.analytics).toEqual({
      totalCalls: 2,
      totalDuration: 60,
      averageDuration: 30,
      completedCalls: 1,
      failedCalls: 1,
    });
  });

  test("returns 400 when request contains invalid JSON", async () => {
    const request = {
      json: jest.fn().mockRejectedValue(new Error("Invalid JSON")),
    };

    const response = await handler(request, context);

    expect(response.status).toBe(400);
    expect(response.jsonBody).toEqual({
      success: false,
      message: "Invalid JSON request body.",
    });

    expect(context.error).toHaveBeenCalled();
  });
});