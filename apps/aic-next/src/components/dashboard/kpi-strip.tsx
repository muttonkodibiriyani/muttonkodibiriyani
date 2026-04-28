import { DashboardKpi } from "@/lib/types";

interface KpiStripProps {
  kpis: DashboardKpi[];
}

export function KpiStrip({ kpis }: KpiStripProps) {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi) => (
        <article key={kpi.label} className="rounded-xl border border-aic-border bg-aic-surface p-4">
          <p className="text-xs uppercase tracking-wide text-aic-muted">{kpi.label}</p>
          <p className="mt-2 text-3xl font-semibold text-aic-text">{kpi.value}</p>
          <p className="mt-1 text-xs text-aic-muted">{kpi.delta}</p>
        </article>
      ))}
    </section>
  );
}
