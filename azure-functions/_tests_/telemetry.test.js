const mockTrackEvent = jest.fn();
const mockTrackException = jest.fn();
const mockFlush = jest.fn();

const mockClient = {
  trackEvent: mockTrackEvent,
  trackException: mockTrackException,
  flush: mockFlush,
};

const mockStart = jest.fn();
const mockSetUseDiskRetryCaching = jest.fn(() => ({
  start: mockStart,
}));
const mockSetAutoCollectConsole = jest.fn(() => ({
  setUseDiskRetryCaching: mockSetUseDiskRetryCaching,
}));
const mockSetAutoCollectDependencies = jest.fn(() => ({
  setAutoCollectConsole: mockSetAutoCollectConsole,
}));
const mockSetAutoCollectExceptions = jest.fn(() => ({
  setAutoCollectDependencies: mockSetAutoCollectDependencies,
}));
const mockSetAutoCollectPerformance = jest.fn(() => ({
  setAutoCollectExceptions: mockSetAutoCollectExceptions,
}));
const mockSetAutoCollectRequests = jest.fn(() => ({
  setAutoCollectPerformance: mockSetAutoCollectPerformance,
}));
const mockSetup = jest.fn(() => ({
  setAutoCollectRequests: mockSetAutoCollectRequests,
}));

jest.mock("applicationinsights", () => ({
  setup: mockSetup,
  defaultClient: mockClient,
}));

describe("Application Insights telemetry service", () => {
  const originalConnectionString =
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  beforeEach(() => {
    jest.resetModules();

    mockSetup.mockClear();
    mockStart.mockClear();
    mockTrackEvent.mockClear();
    mockTrackException.mockClear();
    mockFlush.mockReset();

    delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
  });

  afterAll(() => {
    if (originalConnectionString === undefined) {
      delete process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;
    } else {
      process.env.APPLICATIONINSIGHTS_CONNECTION_STRING =
        originalConnectionString;
    }
  });

  test("does not initialize telemetry when connection string is missing", () => {
    const { initializeTelemetry } = require("../src/services/telemetry");

    const client = initializeTelemetry();

    expect(client).toBeNull();
    expect(mockSetup).not.toHaveBeenCalled();
  });

  test("initializes Application Insights when connection string is configured", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING =
      "InstrumentationKey=test-key";

    const { initializeTelemetry } = require("../src/services/telemetry");

    const client = initializeTelemetry();

    expect(mockSetup).toHaveBeenCalledWith(
      "InstrumentationKey=test-key"
    );
    expect(mockStart).toHaveBeenCalledTimes(1);
    expect(client).toBe(mockClient);
  });

  test("tracks a custom event", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING =
      "InstrumentationKey=test-key";

    const { trackEvent } = require("../src/services/telemetry");

    const result = trackEvent(
      "CdrAnalyticsProcessed",
      {
        source: "cdrAnalytics",
      },
      {
        totalCalls: 3,
        totalDuration: 210,
      }
    );

    expect(result).toBe(true);

    expect(mockTrackEvent).toHaveBeenCalledWith({
      name: "CdrAnalyticsProcessed",
      properties: {
        source: "cdrAnalytics",
      },
      measurements: {
        totalCalls: 3,
        totalDuration: 210,
      },
    });
  });

  test("tracks an exception", () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING =
      "InstrumentationKey=test-key";

    const { trackException } = require("../src/services/telemetry");

    const error = new Error("Service Bus publishing failed");

    const result = trackException(error, {
      component: "serviceBus",
    });

    expect(result).toBe(true);

    expect(mockTrackException).toHaveBeenCalledWith({
      exception: error,
      properties: {
        component: "serviceBus",
      },
    });
  });

  test("does not track events when telemetry is not configured", () => {
    const { trackEvent } = require("../src/services/telemetry");

    const result = trackEvent("CdrAnalyticsProcessed");

    expect(result).toBe(false);
    expect(mockTrackEvent).not.toHaveBeenCalled();
  });

  test("does not track exceptions when telemetry is not configured", () => {
    const { trackException } = require("../src/services/telemetry");

    const result = trackException(new Error("Test error"));

    expect(result).toBe(false);
    expect(mockTrackException).not.toHaveBeenCalled();
  });

  test("flushes queued telemetry", async () => {
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING =
      "InstrumentationKey=test-key";

    mockFlush.mockImplementation(({ callback }) => {
      callback();
    });

    const { flushTelemetry } = require("../src/services/telemetry");

    const result = await flushTelemetry();

    expect(result).toBe(true);
    expect(mockFlush).toHaveBeenCalledTimes(1);
  });
});