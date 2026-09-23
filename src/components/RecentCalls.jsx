
import { useMemo, useState } from "react";

import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "./ui/table";

import {
  formatCurrency,
  formatDuration,
  formatDateTime,
  getDirection,
  getStatus,
} from "../lib/callUtils";

function RecentCalls({
  calls,
  rowsPerPage = 10,
  onSelectCall,
}) {
  const [page, setPage] = useState(1);

  // Sort records by most recent call first
  const sorted = useMemo(
    () =>
      [...calls].sort(
        (a, b) =>
          new Date(b.callStartTime) -
          new Date(a.callStartTime)
      ),
    [calls]
  );

  // Calculate pagination
  const pages = Math.max(
    1,
    Math.ceil(sorted.length / rowsPerPage)
  );

  const safePage = Math.min(page, pages);

  const shown = sorted.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage
  );

  const previousPage = () => {
    setPage(Math.max(1, safePage - 1));
  };

  const nextPage = () => {
    setPage(Math.min(pages, safePage + 1));
  };

  return (
    <div className="glass-card overflow-hidden rounded-2xl">
      {/* Table heading */}
      <div className="flex items-center justify-between p-6">
        <div>
          <h2 className="font-bold text-slate-100">
            Recent Calls
          </h2>

          <p className="text-xs text-slate-400">
            Latest call records from the CDR API ·{" "}
            {calls.length} total
          </p>
        </div>

        <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-600">
          ● Live API data
        </span>
      </div>

      {/* Calls table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-cyan-300/15 bg-cyan-400/5">
              <TableHead>Caller</TableHead>
              <TableHead>Receiver</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Direction</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Cost</TableHead>
              <TableHead>Start Time</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {shown.length > 0 ? (
              shown.map((call) => {
                const incoming =
                  getDirection(call) === "Incoming";

                const successful =
                  getStatus(call) === "Successful";

                return (
                  <TableRow
                    key={call.id}
                    className={`border-white/5 hover:bg-cyan-400/5 ${
                      onSelectCall ? "cursor-pointer" : ""
                    }`}
                    onClick={() => onSelectCall?.(call)}
                  >
                    {/* Caller */}
                    <TableCell>
                      <p className="font-semibold text-slate-100">
                        {call.callerName}
                      </p>

                      <p className="text-xs text-slate-400">
                        {call.callerNumber}
                      </p>
                    </TableCell>

                    {/* Receiver */}
                    <TableCell className="text-slate-300">
                      {call.receiverNumber}
                    </TableCell>

                    {/* City */}
                    <TableCell>
                      <span className="rounded-full bg-cyan-400/10 px-2.5 py-1 text-xs font-medium text-cyan-300">
                        {call.city}
                      </span>
                    </TableCell>

                    {/* Direction */}
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1 font-medium ${
                          incoming
                            ? "text-emerald-600"
                            : "text-fuchsia-300"
                        }`}
                      >
                        {incoming ? (
                          <ArrowDownLeft size={15} />
                        ) : (
                          <ArrowUpRight size={15} />
                        )}

                        {getDirection(call)}
                      </span>
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          successful
                            ? "bg-emerald-400/10 text-emerald-600"
                            : "bg-rose-400/10 text-rose-600"
                        }`}
                      >
                        {getStatus(call)}
                      </span>
                    </TableCell>

                    {/* Duration */}
                    <TableCell>
                      {formatDuration(call.callDuration)}
                    </TableCell>

                    {/* Cost */}
                    <TableCell className="font-semibold text-slate-100">
                      {formatCurrency(call.callCost)}
                    </TableCell>

                    {/* Start time */}
                    <TableCell className="text-xs text-slate-400">
                      {formatDateTime(call.callStartTime)}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="py-10 text-center text-slate-400"
                >
                  No call records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between border-t border-cyan-300/15 px-5 py-4 text-xs text-slate-400">
        <span>
          Page {safePage} of {pages}
        </span>

        <div className="flex gap-2">
          <button
            type="button"
            aria-label="Previous page"
            className="rounded-lg border border-cyan-300/15 bg-slate-950/70 p-2 text-cyan-300 disabled:opacity-30"
            disabled={safePage === 1}
            onClick={previousPage}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            type="button"
            aria-label="Next page"
            className="rounded-lg border border-cyan-300/15 bg-slate-950/70 p-2 text-cyan-300 disabled:opacity-30"
            disabled={safePage === pages}
            onClick={nextPage}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default RecentCalls;