
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Activity } from "lucide-react";

import { dateKey } from "../lib/callUtils";

function CallsChart({ calls }) {
  // Group calls by their start date
  const grouped = Object.values(
    calls.reduce((accumulator, call) => {
      const date = dateKey(call.callStartTime);

      if (!date) {
        return accumulator;
      }

      accumulator[date] ??= {
        date,
        calls: 0,
      };

      accumulator[date].calls += 1;

      return accumulator;
    }, {})
  ).sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="glass-card rounded-2xl p-6">
      {/* Chart heading */}
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-400/10 text-fuchsia-300">
            <Activity size={20} />
          </div>

          <div>
            <h2 className="font-bold text-slate-100">
              Call Activity Timeline
            </h2>

            <p className="text-xs text-slate-400">
              Number of calls per day based on call start time
            </p>
          </div>
        </div>

        <span className="rounded-lg bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-300">
          Daily
        </span>
      </div>

      {/* Chart or empty state */}
      <div className="h-72">
        {grouped.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={grouped}>
              {/* Gradient for the chart line */}
              <defs>
                <linearGradient
                  id="lineGlow"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop
                    offset="0%"
                    stopColor="#7c3aed"
                  />

                  <stop
                    offset="100%"
                    stopColor="#2563eb"
                  />
                </linearGradient>
              </defs>

              {/* Chart grid */}
              <CartesianGrid
                strokeDasharray="4 4"
                stroke="#e0e7ff"
                vertical={false}
              />

              {/* Horizontal axis */}
              <XAxis
                dataKey="date"
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              {/* Vertical axis */}
              <YAxis
                allowDecimals={false}
                stroke="#94a3b8"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />

              {/* Tooltip */}
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e0e7ff",
                  boxShadow:
                    "0 10px 30px rgba(79,70,229,.12)",
                }}
              />

              {/* Call activity line */}
              <Line
                type="monotone"
                dataKey="calls"
                stroke="url(#lineGlow)"
                strokeWidth={3}
                dot={{
                  r: 3,
                  fill: "#fff",
                  stroke: "#7c3aed",
                  strokeWidth: 2,
                }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No API records match the current filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default CallsChart;