import { BadgeCheck, Clock3, FilePlus2, TriangleAlert } from "lucide-react";
import { AppShell } from "@/components/shell/app-shell";
import { KpiCard } from "@/components/cards/kpi-card";

const initiatives = [
  { id: "INV-2026-0041", title: "AI Inventory Optimisation", stage: "Stage 1 · MVP", status: "Approved", budget: "$1.25M", score: 82 },
  { id: "INV-2026-0048", title: "Store Labor Forecasting", stage: "Discovery", status: "In Review", budget: "$420K", score: 74 },
  { id: "INV-2026-0052", title: "Loyalty Offer Personalization", stage: "Submitted", status: "At Risk", budget: "$890K", score: 61 }
];

export default function InitiatorDashboardPage() {
  return (
    <AppShell role="Initiative_Submitter" userName="Dina Al-Saleh">
      <div className="page-header">
        <div>
          <h1 className="page-title">Initiator Dashboard</h1>
          <p className="page-subtitle">Track submissions, drafts, stage-gates, and review outcomes.</p>
        </div>
        <button className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-medium text-white">
          <FilePlus2 size={16} />
          New Initiative
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total initiatives" value="12" hint="+2 this quarter" icon={<FilePlus2 size={18} />} />
        <KpiCard label="Awaiting review" value="4" hint="2 due this week" icon={<Clock3 size={18} />} />
        <KpiCard label="Approved funding" value="$3.9M" hint="Across 5 active initiatives" icon={<BadgeCheck size={18} />} />
        <KpiCard label="At risk" value="2" hint="Require action or resubmission" icon={<TriangleAlert size={18} />} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_.8fr]">
        <div className="card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">My initiatives</h2>
              <p className="text-sm text-slate-500">Latest submissions and current stage status</p>
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Initiative</th>
                  <th className="px-4 py-3 font-medium">Stage</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Budget</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {initiatives.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-4"><div className="font-medium">{item.title}</div><div className="text-xs text-slate-500">{item.id}</div></td>
                    <td className="px-4 py-4">{item.stage}</td>
                    <td className="px-4 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium">{item.status}</span></td>
                    <td className="px-4 py-4">{item.budget}</td>
                    <td className="px-4 py-4">{item.score}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="space-y-6">
          <div className="card p-5">
            <h2 className="text-lg font-semibold">Quick actions</h2>
            <div className="mt-4 grid gap-3">
              {["Create initiative", "Resume latest draft", "Upload supporting file", "View committee notes"].map((x) => (
                <button key={x} className="min-h-11 rounded-2xl border px-4 py-3 text-left text-sm hover:bg-slate-50">{x}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
