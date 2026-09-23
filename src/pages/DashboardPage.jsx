
import {
  Phone,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  MapPin,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import Header from "../components/Header";
import Filters from "../components/Filters";
import StatCard from "../components/StatCard";
import CallsChart from "../components/CallsChart";
import RecentCalls from "../components/RecentCalls";

import {
  formatCurrency,
  formatDuration,
} from "../lib/callUtils";

function DashboardPage({
  calls,
  searchTerm,
  setSearchTerm,
  directionFilter,
  setDirectionFilter,
  statusFilter,
  setStatusFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate,
  resetFilters,
  setSidebarOpen,
}) {
  // Calculate dashboard statistics
  const totalCost = calls.reduce(
    (sum, call) => sum + (Number(call.callCost) || 0),
    0
  );

  const averageDuration = calls.length
    ? calls.reduce(
        (sum, call) => sum + (Number(call.callDuration) || 0),
        0
      ) / calls.length
    : 0;

  const successful = calls.filter(
    (call) => call.callStatus === true
  ).length;

  const failed = calls.filter(
    (call) => call.callStatus === false
  ).length;

  // Calculate top five cities
  const cityMap = calls.reduce((accumulator, call) => {
    const city = call.city || "Unknown";

    accumulator[city] = (accumulator[city] || 0) + 1;

    return accumulator;
  }, {});

  const topCities = Object.entries(cityMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const maxCity = Math.max(
    1,
    ...topCities.map(([, count]) => count)
  );

  // Prepare call status chart data
  const statusData = [
    {
      name: "Successful",
      value: successful,
    },
    {
      name: "Failed",
      value: failed,
    },
  ];

  const cityColors = [
    "bg-violet-500",
    "bg-cyan-400/100",
    "bg-emerald-400/100",
    "bg-amber-400/100",
    "bg-pink-500",
  ];

  return (
    <>
      {/* Header */}
      <Header
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Filters */}
      <Filters
        directionFilter={directionFilter}
        setDirectionFilter={setDirectionFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        onReset={resetFilters}
      />

      {/* Statistics cards */}
      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Calls"
          value={calls.length}
          icon={Phone}
          tone="blue"
          description="Records in current view"
        />

        <StatCard
          title="Total Call Cost"
          value={formatCurrency(totalCost)}
          icon={DollarSign}
          tone="green"
          description="API-provided cost"
        />

        <StatCard
          title="Average Duration"
          value={formatDuration(averageDuration)}
          icon={Clock}
          tone="amber"
          description="Across filtered calls"
        />

        <StatCard
          title="Successful Calls"
          value={successful}
          icon={CheckCircle2}
          tone="violet"
          description={`${
            calls.length
              ? Math.round((successful / calls.length) * 100)
              : 0
          }% success rate`}
        />

        <StatCard
          title="Failed Calls"
          value={failed}
          icon={XCircle}
          tone="rose"
          description={`${
            calls.length
              ? Math.round((failed / calls.length) * 100)
              : 0
          }% failure rate`}
        />
      </section>

      {/* Charts and city statistics */}
      <section className="mt-6 grid gap-6 xl:grid-cols-[2fr_1fr_1fr]">
        <CallsChart calls={calls} />

        {/* Call status chart */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-bold text-slate-100">
            Call Status
          </h2>

          <p className="text-xs text-slate-400">
            Successful vs failed
          </p>

          <div className="relative h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={2}
                >
                  {statusData.map((_, index) => (
                    <Cell
                      key={index}
                      fill={
                        index === 0
                          ? "#10b981"
                          : "#f43f5e"
                      }
                    />
                  ))}
                </Pie>

                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-extrabold text-slate-100">
                  {calls.length}
                </p>

                <p className="text-[10px] text-slate-400">
                  Total Calls
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 text-xs">
            <span className="text-emerald-600">
              ● Successful {successful}
            </span>

            <span className="text-rose-600">
              ● Failed {failed}
            </span>
          </div>
        </div>

        {/* Top five cities */}
        <div className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center gap-2">
            <MapPin
              size={18}
              className="text-fuchsia-300"
            />

            <div>
              <h2 className="font-bold text-slate-100">
                Top 5 Cities
              </h2>

              <p className="text-xs text-slate-400">
                Cities with most calls
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {topCities.map(([city, count], index) => (
              <div key={city}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="max-w-[130px] truncate font-medium text-slate-300">
                    {city}
                  </span>

                  <b className="text-slate-100">
                    {count}
                  </b>
                </div>

                <div className="h-2 rounded-full bg-cyan-400/10">
                  <div
                    className={`h-full rounded-full ${cityColors[index]}`}
                    style={{
                      width: `${
                        Math.max(
                          12,
                          (count / maxCity) * 100
                        )
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent calls table */}
      <section className="mt-6">
        <RecentCalls
          calls={calls}
          rowsPerPage={5}
        />
      </section>
    </>
  );
}

export default DashboardPage;