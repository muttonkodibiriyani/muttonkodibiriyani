import { AppShell } from "@/components/shell/app-shell";

const steps = ["Overview", "Problem & Evidence", "Financial Case", "Risks & Dependencies", "Review & Submit"];

export default function NewInitiativePage() {
  return (
    <AppShell role="Initiative_Submitter" userName="Dina Al-Saleh">
      <div className="page-header">
        <div>
          <h1 className="page-title">New Initiative Wizard</h1>
          <p className="page-subtitle">Step-based submission with autosave-ready structure.</p>
        </div>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_.8fr]">
        <section className="card p-5">
          <div className="mb-5 flex flex-wrap gap-2">
            {steps.map((step, i) => (
              <span key={step} className={`rounded-xl px-3 py-2 text-xs ${i === 0 ? "bg-slate-950 text-white" : "border"}`}>
                {step}
              </span>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="text-sm">Initiative Title<input className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
            <label className="text-sm">Domain<input className="mt-1 w-full rounded-xl border px-3 py-2" /></label>
            <label className="text-sm md:col-span-2">Business Problem<textarea className="mt-1 min-h-28 w-full rounded-xl border px-3 py-2" /></label>
          </div>
        </section>
        <aside className="card p-5">
          <h2 className="text-lg font-semibold">Investment Readiness</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <p>Completion: 24%</p>
            <p>Missing required fields: 11</p>
            <p>Estimated score: 67 / 100</p>
            <p>Risk flags: Financial assumptions incomplete</p>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
