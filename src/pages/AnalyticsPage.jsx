
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import {
  Trophy,
  Timer,
  Clock3,
  WalletCards,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";

import {
  formatCurrency,
  formatDuration,
} from "../lib/callUtils";

// Shared card styling
const box =
  "border-cyan-300/15 bg-slate-950/55 shadow-[0_18px_45px_rgba(0,0,0,.28)] backdrop-blur-xl";

function AnalyticsPage({ calls }) {
  // Calculate call durations
  const durations = calls.map(
    (call) => Number(call.callDuration) || 0
  );

  const longest = durations.length
    ? Math.max(...durations)
    : 0;

  const shortest = durations.length
    ? Math.min(...durations)
    : 0;

  const averageDuration = durations.length
    ? durations.reduce((sum, duration) => sum + duration, 0) /
      durations.length
    : 0;

  // Group calls and costs by city
  const cityMap = calls.reduce((accumulator, call) => {
    const city = call.city || "Unknown";

    accumulator[city] ??= {
      city,
      calls: 0,
      cost: 0,
    };

    accumulator[city].calls += 1;
    accumulator[city].cost += Number(call.callCost) || 0;

    return accumulator;
  }, {});

  const cityData = Object.values(cityMap).sort(
    (a, b) => b.calls - a.calls
  );

  const topCities = cityData.slice(0, 10);

  const topCostCities = [...cityData]
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 10);

  // Calculate call costs
  const totalCost = calls.reduce(
    (sum, call) => sum + (Number(call.callCost) || 0),
    0
  );

  const averageCost = calls.length
    ? totalCost / calls.length
    : 0;

  // Prepare call status chart data
  const statusData = [
    {
      name: "Successful",
      value: calls.filter(
        (call) => call.callStatus === true
      ).length,
    },
    {
      name: "Failed",
      value: calls.filter(
        (call) => call.callStatus === false
      ).length,
    },
  ];

  // Reusable metric card
  const metric = (title, value, Icon, tone) => (
    <Card className={`${box} overflow-hidden`}>
      <CardContent className="flex items-center justify-between p-6">
        <div>
          <p className="text-sm font-semibold text-slate-400">
            {title}
          </p>

          <p className="mt-2 text-3xl font-extrabold text-slate-100">
            {value}
          </p>
        </div>

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}
        >
          <Icon size={22} />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {/* Page heading */}
      <p className="text-sm font-semibold text-fuchsia-300">
        DEEP-DIVE ANALYTICS
      </p>

      <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">
        Call intelligence
      </h1>

      <p className="mb-6 mt-1 text-slate-400">
        Duration, cost, city and call-status insights from the live
        CDR dataset.
      </p>

      {/* Duration metrics */}
      <div className="grid gap-5 md:grid-cols-3">
        {metric(
          "Longest Call",
          formatDuration(longest),
          Trophy,
          "bg-emerald-400/10 text-emerald-600"
        )}

        {metric(
          "Shortest Call",
          formatDuration(shortest),
          Timer,
          "bg-cyan-400/10 text-cyan-300"
        )}

        {metric(
          "Average Duration",
          formatDuration(averageDuration),
          Clock3,
          "bg-amber-400/10 text-amber-600"
        )}
      </div>

      {/* Analytics charts */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        {/* Calls by city */}
        <Card className={box}>
          <CardHeader>
            <CardTitle className="text-slate-100">
              Calls by City
            </CardTitle>

            <CardDescription>
              Top cities by number of calls
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCities}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#e0e7ff"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="city"
                    stroke="#94a3b8"
                    angle={-25}
                    textAnchor="end"
                    height={80}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    allowDecimals={false}
                    axisLine={false}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="calls"
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Call status distribution */}
        <Card className={box}>
          <CardHeader>
            <CardTitle className="text-slate-100">
              Call Status Distribution
            </CardTitle>

            <CardDescription>
              Successful versus failed calls
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
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
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Total cost by city */}
        <Card className={box}>
          <CardHeader>
            <CardTitle className="text-slate-100">
              Total Cost by City
            </CardTitle>

            <CardDescription>
              Top cities by accumulated call cost
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topCostCities}>
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#e0e7ff"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="city"
                    stroke="#94a3b8"
                    angle={-25}
                    textAnchor="end"
                    height={80}
                    axisLine={false}
                  />

                  <YAxis
                    stroke="#94a3b8"
                    axisLine={false}
                  />

                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />

                  <Bar
                    dataKey="cost"
                    fill="#8b5cf6"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Cost summary */}
        <Card
          className={`${box} bg-gradient-to-br from-[#07111f] to-[#211038] text-white`}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-950/5 p-3">
                <WalletCards />
              </div>

              <div>
                <CardTitle>
                  Cost Summary
                </CardTitle>

                <CardDescription className="text-cyan-200">
                  API-provided call costs
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="grid gap-5 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-950/5 p-5">
              <p className="text-sm text-cyan-200">
                Total Call Cost
              </p>

              <p className="mt-2 text-3xl font-extrabold">
                {formatCurrency(totalCost)}
              </p>
            </div>

            <div className="rounded-2xl bg-slate-950/5 p-5">
              <p className="text-sm text-cyan-200">
                Average Cost / Call
              </p>

              <p className="mt-2 text-3xl font-extrabold">
                {formatCurrency(averageCost)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default AnalyticsPage;