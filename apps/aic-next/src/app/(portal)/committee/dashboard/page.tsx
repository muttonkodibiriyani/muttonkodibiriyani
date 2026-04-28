import { AppShell } from "@/components/shell/app-shell";
import { KpiCard } from "@/components/cards/kpi-card";
import { Coins, Landmark, ShieldAlert, Timer } from "lucide-react";

export default function CommitteeDashboardPage() {
  return (
    <AppShell role="Investment_Committee" userName="Faisal Al-Tamimi">
      <div className="page-header">
        <div>
          <h1 className="page-title">Investment Committee Dashboard</h1>
          <p className="page-subtitle">Decision cockpit for capital allocation, risk, and approvals.</p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Pending decisions" value="5" hint="2 require quorum" icon={<Landmark size={18} />} />
        <KpiCard label="Capital requested" value="$8.4M" hint="Current queue" icon={<Coins size={18} />} />
        <KpiCard label="At risk portfolio" value="3" hint="High volatility" icon={<ShieldAlert size={18} />} />
        <KpiCard label="SLA nearing breach" value="1" hint="Action today" icon={<Timer size={18} />} />
      </div>
      <div className="mt-6 card p-5">
        <h2 className="text-lg font-semibold">Decision Queue</h2>
        <p className="mt-1 text-sm text-slate-500">Budget chart and risk matrix modules can be wired here next.</p>
      </div>
    </AppShell>
  );
}
