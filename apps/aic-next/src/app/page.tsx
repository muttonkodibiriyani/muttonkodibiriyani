import { Search } from "lucide-react";
import { KpiStrip } from "@/components/dashboard/kpi-strip";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-aic-bg p-6 md:p-8">
      <header className="mb-6 rounded-2xl border border-aic-border bg-aic-surface p-4 md:flex md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-aic-muted">Executive Workspace</p>
          <h1 className="mt-1 text-2xl font-semibold text-aic-text">AIC Decision Cockpit</h1>
        </div>
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-aic-border bg-white px-3 py-2 md:mt-0 md:w-[360px]">
          <Search className="h-4 w-4 text-aic-muted" />
          <input
            className="w-full border-none bg-transparent text-sm outline-none"
            placeholder="Search initiatives, sponsors, domains..."
          />
        </div>
      </header>

      <KpiStrip />
    </main>
  );
}
