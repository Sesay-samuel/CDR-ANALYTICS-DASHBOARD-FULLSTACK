const mockSendMessages = jest.fn();
const mockSenderClose = jest.fn();
const mockClientClose = jest.fn();
const mockCreateSender = jest.fn();

jest.mock("@azure/service-bus", () => ({
  ServiceBusClient: jest.fn().mockImplementation(() => ({
    createSender: mockCreateSender,
    close: mockClientClose,
  })),
}));

const { ServiceBusClient } = require("@azure/service-bus");
const { sendServiceBusMessage } = require("../src/services/serviceBus");

describe("Azure Service Bus service", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.clearAllMocks();

    process.env = {
      ...originalEnv,
      SERVICE_BUS_CONNECTION_STRING:
        "Endpoint=sb://test.servicebus.windows.net/;SharedAccessKeyName=test;SharedAccessKey=test",
      SERVICE_BUS_QUEUE_NAME: "cdr-analytics",
    };

    mockCreateSender.mockReturnValue({
      sendMessages: mockSendMessages,
      close: mockSenderClose,
    });

    mockSendMessages.mockResolvedValue(undefined);
    mockSenderClose.mockResolvedValue(undefined);
    mockClientClose.mockResolvedValue(undefined);
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  test("sends a CDR analytics message to Azure Service Bus", async () => {
    const messageBody = {
      totalCalls: 3,
      totalDuration: 210,
      averageDuration: 70,
      completedCalls: 2,
      failedCalls: 1,
    };

    const result = await sendServiceBusMessage(messageBody);

    expect(ServiceBusClient).toHaveBeenCalledWith(
      process.env.SERVICE_BUS_CONNECTION_STRING
    );

    expect(mockCreateSender).toHaveBeenCalledWith("cdr-analytics");

    expect(mockSendMessages).toHaveBeenCalledWith({
      body: messageBody,
      contentType: "application/json",
      subject: "cdr-analytics",
      applicationProperties: {
        source: "cdr-analytics-dashboard",
      },
    });

    expect(result).toEqual({
      success: true,
      queueName: "cdr-analytics",
    });

    expect(mockSenderClose).toHaveBeenCalledTimes(1);
    expect(mockClientClose).toHaveBeenCalledTimes(1);
  });

  test("throws an error when Service Bus connection string is missing", async () => {
    delete process.env.SERVICE_BUS_CONNECTION_STRING;

    await expect(
      sendServiceBusMessage({ totalCalls: 1 })
    ).rejects.toThrow(
      "SERVICE_BUS_CONNECTION_STRING is not configured"
    );

    expect(ServiceBusClient).not.toHaveBeenCalled();
  });

  test("throws an error when Service Bus queue name is missing", async () => {
    delete process.env.SERVICE_BUS_QUEUE_NAME;

    await expect(
      sendServiceBusMessage({ totalCalls: 1 })
    ).rejects.toThrow(
      "SERVICE_BUS_QUEUE_NAME is not configured"
    );

    expect(ServiceBusClient).not.toHaveBeenCalled();
  });

  test("closes Service Bus resources when sending fails", async () => {
    mockSendMessages.mockRejectedValueOnce(
      new Error("Service Bus unavailable")
    );

    await expect(
      sendServiceBusMessage({ totalCalls: 1 })
    ).rejects.toThrow("Service Bus unavailable");

    expect(mockSenderClose).toHaveBeenCalledTimes(1);
    expect(mockClientClose).toHaveBeenCalledTimes(1);
  });
});