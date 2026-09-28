// Mock the Azure Functions registration API before loading the function.
jest.mock("@azure/functions", () => ({
  app: {
    http: jest.fn((name, options) => {
      global.__cdrAnalyticsHandler = options.handler;
    }),
  },
}));

// Mock Azure Service Bus so unit tests never connect to Azure.
jest.mock("../src/services/serviceBus", () => ({
  sendServiceBusMessage: jest.fn(),
}));

const {
  sendServiceBusMessage,
} = require("../src/services/serviceBus");

// Loading this file registers the function and gives us access
// to its handler through the Azure Functions mock above.
require("../src/functions/cdrAnalytics");

describe("cdrAnalytics Azure Function", () => {
  let handler;
  let context;

  beforeAll(() => {
    handler = global.__cdrAnalyticsHandler;
  });

  beforeEach(() => {
    jest.clearAllMocks();

    context = {
      log: jest.fn(),
      error: jest.fn(),
    };

    sendServiceBusMessage.mockResolvedValue({
      success: true,
      queueName: "cdr-analytics",
    });
  });

  test("calculates analytics and publishes them to Service Bus", async () => {
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

    const expectedAnalytics = {
      totalCalls: 3,
      totalDuration: 210,
      averageDuration: 70,
      completedCalls: 2,
      failedCalls: 1,
    };

    expect(response.status).toBe(200);

    expect(response.jsonBody).toEqual({
      success: true,
      analytics: expectedAnalytics,
      messaging: {
        published: true,
        queueName: "cdr-analytics",
      },
    });

    expect(sendServiceBusMessage).toHaveBeenCalledTimes(1);
    expect(sendServiceBusMessage).toHaveBeenCalledWith(
      expectedAnalytics
    );

    expect(context.log).toHaveBeenCalledWith(
      "CDR Analytics Azure Function invoked."
    );
  });

  test("returns zero analytics for an empty records array without publishing", async () => {
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

    expect(sendServiceBusMessage).not.toHaveBeenCalled();
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

    expect(sendServiceBusMessage).not.toHaveBeenCalled();
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

    expect(sendServiceBusMessage).not.toHaveBeenCalled();
  });

  test("handles invalid durations and publishes calculated analytics", async () => {
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

    const expectedAnalytics = {
      totalCalls: 2,
      totalDuration: 60,
      averageDuration: 30,
      completedCalls: 1,
      failedCalls: 1,
    };

    expect(response.status).toBe(200);
    expect(response.jsonBody.analytics).toEqual(
      expectedAnalytics
    );

    expect(response.jsonBody.messaging).toEqual({
      published: true,
      queueName: "cdr-analytics",
    });

    expect(sendServiceBusMessage).toHaveBeenCalledWith(
      expectedAnalytics
    );
  });

  test("returns 400 when request contains invalid JSON", async () => {
    const request = {
      json: jest.fn().mockRejectedValue(
        new Error("Invalid JSON")
      ),
    };

    const response = await handler(request, context);

    expect(response.status).toBe(400);

    expect(response.jsonBody).toEqual({
      success: false,
      message: "CDR analytics processing failed.",
    });

    expect(sendServiceBusMessage).not.toHaveBeenCalled();
    expect(context.error).toHaveBeenCalled();
  });

  test("returns an error when Service Bus publishing fails", async () => {
    sendServiceBusMessage.mockRejectedValueOnce(
      new Error("Service Bus unavailable")
    );

    const request = {
      json: jest.fn().mockResolvedValue({
        records: [
          {
            duration: 120,
            status: "completed",
          },
        ],
      }),
    };

    const response = await handler(request, context);

    expect(response.status).toBe(400);

    expect(response.jsonBody).toEqual({
      success: false,
      message: "CDR analytics processing failed.",
    });

    expect(sendServiceBusMessage).toHaveBeenCalledTimes(1);
    expect(context.error).toHaveBeenCalled();
  });
});