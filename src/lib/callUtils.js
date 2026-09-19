
export const getDirection = (call) => {
  const direction = String(call?.callDirection ?? "")
    .trim()
    .toLowerCase();

  if (direction === "incoming") {
    return "Incoming";
  }

  if (direction === "outgoing") {
    return "Outgoing";
  }

  return "Unknown";
};

export const getStatus = (call) => {
  return call?.callStatus ? "Successful" : "Failed";
};

export const getCost = (call) => {
  return Number(call?.callCost) || 0;
};

export const getDurationSeconds = (call) => {
  return Number(call?.callDuration) || 0;
};

export const formatDuration = (seconds) => {
  const total = Math.max(
    0,
    Math.round(Number(seconds) || 0)
  );

  const minutes = Math.floor(total / 60);
  const secs = total % 60;

  return `${minutes}m ${String(secs).padStart(2, "0")}s`;
};

export const formatCurrency = (value) => {
  return Number(value || 0).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
  });
};

export const formatDateTime = (value) => {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("en-GB");
};

export const dateKey = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? ""
    : date.toISOString().slice(0, 10);
};