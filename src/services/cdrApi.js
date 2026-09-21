
const API_BASE_URL = import.meta.env.DEV
  ? "http://localhost:4000"
  : "";

const LOGIN_API_URL = `${API_BASE_URL}/api/login`;
const CDR_API_URL = `${API_BASE_URL}/api/cdr`;

// Send the user's credentials to the backend
export const loginUser = async (email, password) => {
  const response = await fetch(LOGIN_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Login failed");
  }

  if (!data.token) {
    throw new Error("Login response did not include a token");
  }

  return data;
};

// Fetch CDR records using the JWT received after login
export const fetchCDRRecords = async (token) => {
  if (!token) {
    throw new Error("Please log in to view CDR records");
  }

  const response = await fetch(CDR_API_URL, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (response.status === 401) {
    throw new Error("Your session is invalid or has expired. Please log in again.");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch CDR records: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid CDR API response");
  }

  return data;
};