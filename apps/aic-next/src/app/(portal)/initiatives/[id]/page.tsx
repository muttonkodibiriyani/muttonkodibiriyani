import { BadgeCheck, Coins, Gauge, History, ShieldAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { AppShell } from "@/components/shell/app-shell";

export default function InitiativeDetailPage() {
  return (
    <AppShell role="Strategy_Reviewer" userName="Sarah Al-Rashidi">
      <div className="page-header">
        <div>
          <div className="mb-2 text-xs uppercase tracking-[0.16em] text-slate-500">INV-2026-0041</div>
          <h1 className="page-title">AI-Powered Inventory Optimisation</h1>
          <p className="page-subtitle">Retail Supply Chain · Starbucks GCC · Sponsored by Faisal Al-Tamimi</p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.7fr_.75fr]">
        <div className="space-y-6">
          <div className="card p-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <InfoMini icon={<Gauge size={16} />} label="Gatekeeper score" value="82 / 100" />
              <InfoMini icon={<BadgeCheck size={16} />} label="Council score" value="79 / 100" />
              <InfoMini icon={<Coins size={16} />} label="Budget requested" value="$1.25M" />
              <InfoMini icon={<TriangleAlert size={16} />} label="Risk level" value="Moderate" />
            </div>
          </div>
          <div className="card p-5">
            <h3 className="text-base font-semibold">Summary</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Current manual replenishment creates food waste and stockout risk; proposed ML forecasting addresses both.
            </p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-5">
            <div className="flex items-center gap-2"><ShieldAlert size={18} /><h2 className="text-lg font-semibold">Top risks</h2></div>
            <div className="mt-4 space-y-3">
              {["ERP integration complexity", "Model drift in seasonal spikes", "Store ops adoption risk"].map((risk) => (
                <div key={risk} className="rounded-2xl border px-4 py-3 text-sm">{risk}</div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <div className="flex items-center gap-2"><History size={18} /><h2 className="text-lg font-semibold">Audit snapshot</h2></div>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Submitted</span><span>12 Mar 2026</span></div>
              <div className="flex justify-between"><span>Strategy review</span><span>18 Mar 2026</span></div>
              <div className="flex justify-between"><span>Committee reviewed</span><span>03 Apr 2026</span></div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function InfoMini({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border p-4">
      <div className="mb-3 text-slate-400">{icon}</div>
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold">{value}</div>
    </div>
  );
}
