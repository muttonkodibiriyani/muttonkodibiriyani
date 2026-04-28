import type { ReactNode } from "react";

export function KpiCard({
  label,
  value,
  hint,
  icon
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="kpi-label">{label}</div>
        <div className="text-slate-400">{icon}</div>
      </div>
      <div className="kpi-value">{value}</div>
      {hint ? <div className="mt-2 text-sm text-slate-500">{hint}</div> : null}
    </div>
  );
}
