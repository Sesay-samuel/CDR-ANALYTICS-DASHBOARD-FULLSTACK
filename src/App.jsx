
import { useEffect, useMemo, useState } from "react";

import DashboardPage from "./pages/DashboardPage";
import CallRecordsPage from "./pages/CallRecordsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import Sidebar from "./components/Sidebar";

import { fetchCDRRecords, fetchAnalyticsSummary, loginUser } from "./services/cdrApi";
import { dateKey, getDirection, getStatus } from "./lib/callUtils";

function App() {
  // Authentication
  const [token, setToken] = useState("");
  const [role, setRole] = useState("");
  const [analytics, setAnalytics] = useState(null);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // CDR API data
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(false);
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

  // Log in using the PostgreSQL-backed authentication endpoint
  const handleLogin = async (event) => {
    event.preventDefault();

    setLoginLoading(true);
    setLoginError("");

    try {
      const result = await loginUser(loginEmail, loginPassword);

      setLoginPassword("");
    const userRole = result.user?.role;

    if (!["admin", "analyst"].includes(userRole)) {
    throw new Error("Your account does not have a valid role.");
        }

setRole(userRole);
setActivePage(userRole === "analyst" ? "Analytics" : "Dashboard");
setToken(result.token);;
    } catch (err) {
      setLoginError(err.message || "Unable to log in.");
    } finally {
      setLoginLoading(false);
    }
  };

  // Clear the current session
  const handleLogout = () => {
    setToken("");
    setCalls([]);
    setError("");
    setLoginPassword("");
    setActivePage("Dashboard");
    setSidebarOpen(false);
    setRole("");
    setAnalytics(null);
  };

  // Fetch CDR records after login
                           
useEffect(() => {
  if (!token || !role) {
    return;
  }

  let active = true;

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");

      if (role === "analyst") {
        // Analysts receive aggregated analytics, not raw CDR records.
        setCalls([]);

        const summary = await fetchAnalyticsSummary(token);

        if (active) {
          setAnalytics(summary);
        }
      } else {
        // Preserve the existing Admin dashboard.
        setAnalytics(null);

        const data = await fetchCDRRecords(token);

        if (active) {
          setCalls(data);
        }
      }
    } catch (err) {
      if (active) {
        const message = err.message || "Unable to load data.";

        if (
          message.includes("session is invalid") ||
          message.includes("expired")
        ) {
          setToken("");
          setRole("");
          setCalls([]);
          setAnalytics(null);
          setLoginError(message);
        } else {
          setError(message);
        }
      }
    } finally {
      if (active) {
        setLoading(false);
      }
    }
  };

  loadData();

  return () => {
    active = false;
  };
}, [token, role]);
       

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
            .includes(query)
        );

      const direction = getDirection(call).toLowerCase();
      const status = getStatus(call).toLowerCase();
      const callDate = dateKey(call.callStartTime);

      const directionOk =
        directionFilter === "all" || direction === directionFilter;

      const statusOk =
        statusFilter === "all" || status === statusFilter;

      const startDateOk = !startDate || callDate >= startDate;
      const endDateOk = !endDate || callDate <= endDate;

      return searchOk && directionOk && statusOk && startDateOk && endDateOk;
    });
  }, [
    calls,
    searchTerm,
    directionFilter,
    statusFilter,
    startDate,
    endDate,
  ]);

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setDirectionFilter("all");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  // Render the selected dashboard page
                              
if (role === "analyst") {
  if (!analytics) {
    return <p className="text-slate-400">No analytics available.</p>;
  }

  return (
    <section className="space-y-6">
                                     
<div className="flex items-center justify-between gap-4">
  <span className="text-sm font-medium text-cyan-400">
    Analyst · View-only access
  </span>

  <button
    type="button"
    onClick={handleLogout}
    className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-cyan-500 hover:text-cyan-400"
  >
    Log out
  </button>
</div>
      <div>
        <p className="text-sm font-semibold uppercase text-cyan-400">
          Analyst · View-only analytics
        </p>
        <h1 className="mt-2 text-3xl font-bold">
          Call Analytics
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-slate-400">Total Calls</p>
          <p className="mt-2 text-3xl font-bold">
            {analytics.totalCalls.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-slate-400">Total Duration (seconds)</p>
          <p className="mt-2 text-3xl font-bold">
            {analytics.totalDuration.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-slate-400">Incoming Calls</p>
          <p className="mt-2 text-3xl font-bold">
            {analytics.callTypeDistribution.incoming.toLocaleString()}
          </p>
        </div>

        <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
          <p className="text-slate-400">Outgoing Calls</p>
          <p className="mt-2 text-3xl font-bold">
            {analytics.callTypeDistribution.outgoing.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-900 p-6">
        <h2 className="mb-4 text-xl font-bold">Top Callers</h2>

        <div className="space-y-3">
          {analytics.topCallers.map((caller) => (
            <div
              key={caller.callerNumber}
              className="flex justify-between border-b border-slate-800 pb-2"
            >
              <span>{caller.callerNumber}</span>
              <span className="font-semibold">{caller.totalCalls}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
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

  // Show the login screen until the user authenticates
  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-200">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-cyan-400">
              CDR Analytics
            </h1>

            <p className="mt-2 text-sm text-slate-400">
              Sign in to access your dashboard
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="login-email"
                className="mb-2 block text-sm font-medium"
              >
                Email address
              </label>

              <input
                id="login-email"
                type="email"
                autoComplete="username"
                required
                value={loginEmail}
                onChange={(event) => setLoginEmail(event.target.value)}
                placeholder="Enter your email"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label
                htmlFor="login-password"
                className="mb-2 block text-sm font-medium"
              >
                Password
              </label>

              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={loginPassword}
                onChange={(event) => setLoginPassword(event.target.value)}
                placeholder="Enter your password"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-cyan-400"
              />
            </div>

            {loginError && (
              <p
                role="alert"
                className="rounded-lg border border-red-900 bg-red-950/40 p-3 text-sm text-red-300"
              >
                {loginError}
              </p>
            )}

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loginLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Show the dashboard after login
  return (
    <div className="min-h-screen text-slate-200">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <main className={`min-h-screen p-4 sm:p-6 lg:p-8 xl:p-10 ${role === "admin" ? "lg:ml-60" : ""}`}>
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 hover:border-cyan-500 hover:text-cyan-400"
          >
            Log out
          </button>
        </div>

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