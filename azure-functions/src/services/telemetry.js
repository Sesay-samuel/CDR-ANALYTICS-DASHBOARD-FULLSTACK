const appInsights = require("applicationinsights");

let telemetryClient = null;
let telemetryStarted = false;

/**
 * Initializes Azure Application Insights telemetry.
 *
 * Telemetry is enabled only when an Application Insights
 * connection string is configured. This allows local development
 * and automated tests to run without requiring Azure credentials.
 *
 * @returns {Object|null} Application Insights telemetry client.
 */
function initializeTelemetry() {
  const connectionString =
    process.env.APPLICATIONINSIGHTS_CONNECTION_STRING;

  if (!connectionString) {
    return null;
  }

  if (!telemetryStarted) {
    appInsights
      .setup(connectionString)
      .setAutoCollectRequests(true)
      .setAutoCollectPerformance(true, true)
      .setAutoCollectExceptions(true)
      .setAutoCollectDependencies(true)
      .setAutoCollectConsole(true, true)
      .setUseDiskRetryCaching(true)
      .start();

    telemetryClient = appInsights.defaultClient;
    telemetryStarted = true;
  }

  return telemetryClient;
}

/**
 * Records a custom Application Insights event.
 *
 * @param {string} name Event name.
 * @param {Object} properties Non-sensitive event properties.
 * @param {Object} measurements Numeric measurements.
 */
function trackEvent(name, properties = {}, measurements = {}) {
  const client = initializeTelemetry();

  if (!client) {
    return false;
  }

  client.trackEvent({
    name,
    properties,
    measurements,
  });

  return true;
}

/**
 * Records an exception in Application Insights.
 *
 * @param {Error} error Error to record.
 * @param {Object} properties Non-sensitive diagnostic properties.
 */
function trackException(error, properties = {}) {
  const client = initializeTelemetry();

  if (!client) {
    return false;
  }

  const exception =
    error instanceof Error ? error : new Error(String(error));

  client.trackException({
    exception,
    properties,
  });

  return true;
}

/**
 * Flushes queued telemetry.
 *
 * Useful when the Azure Functions host is shutting down or
 * when explicitly flushing telemetry during tests.
 */
async function flushTelemetry() {
  const client = initializeTelemetry();

  if (!client) {
    return false;
  }

  await new Promise((resolve) => {
    client.flush({
      callback: resolve,
    });
  });

  return true;
}

module.exports = {
  initializeTelemetry,
  trackEvent,
  trackException,
  flushTelemetry,
};