import { useEffect, useMemo, useState } from "react";

import DashboardPage from "./pages/DashboardPage";
import CallRecordsPage from "./pages/CallRecordsPage";
import AnalyticsPage from "./pages/AnalyticsPage";

import Sidebar from "./components/Sidebar";

import { fetchCDRRecords } from "./services/cdrApi";
import { dateKey, getDirection, getStatus } from "./lib/callUtils";

function App() {
  // CDR API data
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Navigation
  const [activePage, setActivePage] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [directionFilter, setDirectionFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch CDR records when the application starts
  useEffect(() => {
    let active = true;

    const loadCDRRecords = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await fetchCDRRecords();

        if (active) {
          setCalls(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load CDR data.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCDRRecords();

    return () => {
      active = false;
    };
  }, []);

  // Apply search and filters
  const filteredCalls = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return calls.filter((call) => {
      const searchOk =
        !query ||
        [
          call.callerName,
          call.callerNumber,
          call.receiverNumber,
          call.city,
        ].some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(query),
        );

      const direction = getDirection(call).toLowerCase();
      const status = getStatus(call).toLowerCase();
      const callDate = dateKey(call.callStartTime);

      const directionOk =
        directionFilter === "all" || direction === directionFilter;

      const statusOk = statusFilter === "all" || status === statusFilter;

      const startDateOk = !startDate || callDate >= startDate;

      const endDateOk = !endDate || callDate <= endDate;

      return searchOk && directionOk && statusOk && startDateOk && endDateOk;
    });
  }, [calls, searchTerm, directionFilter, statusFilter, startDate, endDate]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setDirectionFilter("all");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  // Render the selected page
  const renderPage = () => {
    switch (activePage) {
      case "Call Records":
        return <CallRecordsPage calls={filteredCalls} />;

      case "Analytics":
        return <AnalyticsPage calls={filteredCalls} />;

      case "Dashboard":
      default:
        return (
          <DashboardPage
            calls={filteredCalls}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            directionFilter={directionFilter}
            setDirectionFilter={setDirectionFilter}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            startDate={startDate}
            setStartDate={setStartDate}
            endDate={endDate}
            setEndDate={setEndDate}
            resetFilters={resetFilters}
            setSidebarOpen={setSidebarOpen}
          />
        );
    }
  };

  return (
    <div className="min-h-screen text-slate-200">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className="min-h-screen p-4 sm:p-6 lg:ml-60 lg:p-8 xl:p-10">
        {loading ? (
          <div className="flex min-h-[60vh] items-center justify-center text-cyan-400">
            Loading CDR records from API…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-900 bg-red-950/40 p-6">
            <h1 className="text-xl font-bold text-red-300">
              Unable to load CDR data
            </h1>

            <p className="mt-2 text-red-200">{error}</p>

            <button
              type="button"
              className="mt-4 rounded bg-red-700 px-4 py-2"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
          </div>
        ) : (
          renderPage()
        )}
      </main>
    </div>
  );
}

export default App;
