import { AppShell } from "@/components/shell/app-shell";
import { KpiCard } from "@/components/cards/kpi-card";
import { ClipboardCheck, Gauge, Target, TriangleAlert } from "lucide-react";

export default function StrategyDashboardPage() {
  return (
    <AppShell role="Strategy_Reviewer" userName="Sarah Al-Rashidi">
      <div className="page-header">
        <div>
          <h1 className="page-title">Strategy Reviewer Dashboard</h1>
          <p className="page-subtitle">Score, compare, and escalate initiatives with confidence.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Review queue" value="7" hint="3 due today" icon={<ClipboardCheck size={18} />} />
        <KpiCard label="Avg gatekeeper score" value="78" hint="Weighted model" icon={<Gauge size={18} />} />
        <KpiCard label="Escalations" value="2" hint="Needs committee view" icon={<Target size={18} />} />
        <KpiCard label="At risk" value="3" hint="Low evidence quality" icon={<TriangleAlert size={18} />} />
      </div>
      <div className="mt-6 card p-5">
        <h2 className="text-lg font-semibold">Review Queue</h2>
        <p className="mt-1 text-sm text-slate-500">Filters and side-panel scoring can be attached here next.</p>
      </div>
    </AppShell>
  );
}
