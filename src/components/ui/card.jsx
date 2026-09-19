import { cn } from "../../lib/utils";
export function Card({ className, ...props }) { return <div className={cn("rounded-xl border border-slate-800 bg-slate-900", className)} {...props} />; }
export function CardHeader({ className, ...props }) { return <div className={cn("p-6 pb-2", className)} {...props} />; }
export function CardTitle({ className, ...props }) { return <h3 className={cn("font-semibold text-white", className)} {...props} />; }
export function CardDescription({ className, ...props }) { return <p className={cn("text-sm text-slate-400", className)} {...props} />; }
export function CardContent({ className, ...props }) { return <div className={cn("p-6 pt-2", className)} {...props} />; }
