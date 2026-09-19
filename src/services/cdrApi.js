
const CDR_API_URL = "http://localhost:4000/api/cdr";

export const fetchCDRRecords = async () => {
  const response = await fetch(CDR_API_URL);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch CDR records: ${response.status}`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("Invalid CDR API response");
  }

  return data;
};