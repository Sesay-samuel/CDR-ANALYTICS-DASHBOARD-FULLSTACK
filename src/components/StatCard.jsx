
import { Card, CardContent } from "./ui/card";

// Color styles for each card type
const tones = {
  blue: "from-blue-50 to-indigo-50 text-cyan-300",
  green: "from-emerald-50 to-teal-50 text-emerald-600",
  amber: "from-amber-50 to-orange-50 text-amber-600",
  violet: "from-violet-50 to-purple-50 text-fuchsia-300",
  rose: "from-rose-50 to-pink-50 text-rose-600",
};

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  tone = "blue",
}) {
  return (
    <Card
      className={`overflow-hidden border-cyan-300/15 bg-gradient-to-br ${
        tones[tone] || tones.blue
      } shadow-[0_10px_30px_rgba(79,70,229,.06)]`}
    >
      <CardContent className="p-5">
        {/* Card heading and icon */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-300">
              {title}
            </p>

            <div className="mt-2 text-2xl font-extrabold tracking-tight text-slate-100 xl:text-3xl">
              {value}
            </div>
          </div>

          {Icon && (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950/55 shadow-sm">
              <Icon size={21} />
            </div>
          )}
        </div>

        {/* Optional description */}
        {description && (
          <p className="mt-3 text-xs font-medium opacity-80">
            {description}
          </p>
        )}

        {/* Decorative progress bar */}
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-900/55">
          <div className="h-full w-2/3 rounded-full bg-current opacity-50" />
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;