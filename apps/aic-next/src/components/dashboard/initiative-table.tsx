import { Initiative } from "@/lib/types";

interface InitiativeTableProps {
  initiatives: Initiative[];
  emptyMessage: string;
}

function scoreCell(value: number | null) {
  if (value === null) return <span className="text-aic-muted">Pending</span>;
  return <span className="font-medium text-aic-text">{value}</span>;
}

export function InitiativeTable({ initiatives, emptyMessage }: InitiativeTableProps) {
  if (!initiatives.length) {
    return (
      <section className="rounded-xl border border-aic-border bg-aic-surface p-6 text-sm text-aic-muted">
        {emptyMessage}
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-xl border border-aic-border bg-aic-surface">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-aic-muted">
          <tr>
            <th className="px-4 py-3">Initiative</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Markets</th>
            <th className="px-4 py-3">Gatekeeper</th>
            <th className="px-4 py-3">Shark</th>
            <th className="px-4 py-3">CXO Avg</th>
          </tr>
        </thead>
        <tbody>
          {initiatives.map((item) => (
            <tr key={item.id} className="border-t border-aic-border">
              <td className="px-4 py-3">
                <p className="font-medium text-aic-text">{item.title}</p>
                <p className="text-xs text-aic-muted">
                  {item.id} · {item.sponsor}
                </p>
              </td>
              <td className="px-4 py-3">{item.status}</td>
              <td className="px-4 py-3">{item.markets.join(", ")}</td>
              <td className="px-4 py-3">{scoreCell(item.gatekeeperScore)}</td>
              <td className="px-4 py-3">{scoreCell(item.sharkScore)}</td>
              <td className="px-4 py-3">{scoreCell(item.cxoAverageScore)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
