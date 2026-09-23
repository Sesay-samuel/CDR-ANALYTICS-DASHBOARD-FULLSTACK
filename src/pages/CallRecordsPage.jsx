
import { useState } from "react";
import { PhoneCall, X } from "lucide-react";
import RecentCalls from "../components/RecentCalls";

import {
  formatCurrency,
  formatDuration,
  formatDateTime,
  getDirection,
  getStatus,
} from "../lib/callUtils";

function CallRecordsPage({ calls }) {
  const [selected, setSelected] = useState(null);

  const closeModal = () => {
    setSelected(null);
  };

  return (
    <div>
      {/* Page heading */}
      <p className="text-sm font-semibold text-fuchsia-300">
        CDR RECORD EXPLORER
      </p>

      <h1 className="text-4xl font-extrabold tracking-tight text-slate-100">
        Call Records
      </h1>

      <p className="mb-6 mt-1 text-slate-400">
        Explore detailed records returned by the CDR API. Select any
        row for a full call summary.
      </p>

      {/* Call records table */}
      <RecentCalls
        calls={calls}
        rowsPerPage={10}
        onSelectCall={setSelected}
      />

      {/* Selected call details modal */}
      {selected && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-[#07111f]/40 p-4 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-3xl bg-slate-950/70 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-blue-600 p-6 text-white">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-950/15 p-3">
                  <PhoneCall />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Call details
                  </h2>

                  <p className="text-xs text-indigo-100">
                    Record ID #{selected.id}
                  </p>
                </div>
              </div>

              <button
                type="button"
                aria-label="Close call details"
                className="rounded-full bg-slate-950/5 p-2"
                onClick={closeModal}
              >
                <X size={18} />
              </button>
            </div>

            {/* Call details */}
            <div className="grid gap-4 p-6 text-sm sm:grid-cols-2">
              {[
                [
                  "Caller",
                  `${selected.callerName} (${selected.callerNumber})`,
                ],
                ["Receiver", selected.receiverNumber],
                ["City", selected.city],
                ["Direction", getDirection(selected)],
                ["Status", getStatus(selected)],
                [
                  "Duration",
                  formatDuration(selected.callDuration),
                ],
                [
                  "Cost",
                  formatCurrency(selected.callCost),
                ],
                [
                  "Start",
                  formatDateTime(selected.callStartTime),
                ],
                [
                  "End",
                  formatDateTime(selected.callEndTime),
                ],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-xl bg-cyan-400/10 p-3"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {label}
                  </p>

                  <p className="mt-1 font-semibold text-slate-100">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CallRecordsPage;