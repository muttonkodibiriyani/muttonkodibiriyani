import Link from "next/link";
import { WORKSPACE_ORDER, WORKSPACE_CONFIG } from "@/lib/workspace-config";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-aic-bg p-6 md:p-8">
      <header className="mb-6 rounded-2xl border border-aic-border bg-aic-surface p-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-aic-muted">AIC Next.js Migration</p>
          <h1 className="mt-1 text-2xl font-semibold text-aic-text">Dynamic Workspace Router</h1>
          <p className="mt-2 text-sm text-aic-muted">
            This app is now config-driven. Add or modify roles, cards, and filters via typed config/data modules
            instead of static HTML pages.
          </p>
        </div>
      </header>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {WORKSPACE_ORDER.map((role) => {
          const cfg = WORKSPACE_CONFIG[role];
          return (
            <Link
              key={role}
              href={`/workspace/${role}`}
              className="rounded-xl border border-aic-border bg-aic-surface p-4 transition hover:border-blue-300"
            >
              <p className="text-xs uppercase tracking-wide text-aic-muted">{role.replaceAll("_", " ")}</p>
              <p className="mt-2 text-lg font-semibold text-aic-text">{cfg.title}</p>
              <p className="mt-1 text-sm text-aic-muted">{cfg.subtitle}</p>
            </Link>
          );
        })}
      </section>

      <section className="mt-6 rounded-xl border border-aic-border bg-aic-surface p-4 text-sm">
        <p className="font-medium text-aic-text">Dynamic API endpoints ready</p>
        <div className="mt-2 space-y-1 text-aic-muted">
          <p>
            <code>/api/initiatives?role=strategy_reviewer&amp;q=search</code>
          </p>
          <p>
            <code>/api/dashboard/investment_committee</code>
          </p>
        </div>
      </section>
    </main>
  );
}
