import { cn } from "../../lib/utils";
export function Table({ className, ...props }) { return <div className="w-full overflow-x-auto"><table className={cn("w-full text-sm", className)} {...props} /></div>; }
export function TableHeader(props) { return <thead {...props} />; }
export function TableBody(props) { return <tbody {...props} />; }
export function TableRow({ className, ...props }) { return <tr className={cn("border-b border-slate-800", className)} {...props} />; }
export function TableHead({ className, ...props }) { return <th className={cn("px-4 py-3 text-left font-medium text-slate-400", className)} {...props} />; }
export function TableCell({ className, ...props }) { return <td className={cn("px-4 py-3 text-slate-200", className)} {...props} />; }
