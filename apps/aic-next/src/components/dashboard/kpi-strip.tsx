type Kpi = {
  label: string;
  value: string;
  delta: string;
};

const KPIS: Kpi[] = [
  { label: "Active initiatives", value: "24", delta: "+3 this month" },
  { label: "Awaiting strategy review", value: "7", delta: "2 high priority" },
  { label: "Awaiting CXO vote", value: "5", delta: "1 near SLA" },
  { label: "Avg shark score", value: "78", delta: "+4 vs last cycle" }
];

export function KpiStrip() {
  return (
    <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {KPIS.map((kpi) => (
        <article key={kpi.label} className="rounded-xl border border-aic-border bg-aic-surface p-4">
          <p className="text-xs uppercase tracking-wide text-aic-muted">{kpi.label}</p>
          <p className="mt-2 text-3xl font-semibold text-aic-text">{kpi.value}</p>
          <p className="mt-1 text-xs text-aic-muted">{kpi.delta}</p>
        </article>
      ))}
    </section>
  );
}
