const { ServiceBusClient } = require("@azure/service-bus");

/**
 * Sends a message to an Azure Service Bus queue.
 *
 * @param {Object} messageBody - Data to send to the queue.
 * @returns {Promise<Object>} Information about the queued message.
 */
async function sendServiceBusMessage(messageBody) {
  const connectionString = process.env.SERVICE_BUS_CONNECTION_STRING;
  const queueName = process.env.SERVICE_BUS_QUEUE_NAME;

  if (!connectionString) {
    throw new Error("SERVICE_BUS_CONNECTION_STRING is not configured");
  }

  if (!queueName) {
    throw new Error("SERVICE_BUS_QUEUE_NAME is not configured");
  }

  const serviceBusClient = new ServiceBusClient(connectionString);
  const sender = serviceBusClient.createSender(queueName);

  const message = {
    body: messageBody,
    contentType: "application/json",
    subject: "cdr-analytics",
    applicationProperties: {
      source: "cdr-analytics-dashboard",
    },
  };

  try {
    await sender.sendMessages(message);

    return {
      success: true,
      queueName,
    };
  } finally {
    await sender.close();
    await serviceBusClient.close();
  }
}

module.exports = {
  sendServiceBusMessage,
};