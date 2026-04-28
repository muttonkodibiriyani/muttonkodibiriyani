import { Building2, Lock, ShieldCheck, Sparkles } from "lucide-react";
import { TrustChip } from "@/components/auth/trust-chip";

function Feature({ number, title, desc }: { number: string; title: string; desc: string }) {
  return (
    <div className="grid grid-cols-[40px_1fr] gap-4">
      <div className="pt-0.5 text-[11px] font-semibold tracking-[0.18em] text-blue-300">{number}</div>
      <div>
        <div className="text-[15px] font-semibold text-white">{title}</div>
        <div className="mt-1 text-sm leading-6 text-slate-400">{desc}</div>
      </div>
    </div>
  );
}

export function HeroPanel() {
  return (
    <section className="relative hidden overflow-hidden bg-[#081226] lg:flex" aria-label="AIC brand and trust section">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(99,102,241,0.16),transparent_28%),linear-gradient(180deg,#0b1730_0%,#081226_100%)]" />
        <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(rgba(255,255,255,.55)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,18,38,.25))]" />
      </div>

      <div className="relative z-10 flex w-full flex-col px-10 py-8 xl:px-14 xl:py-10">
        <header className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 text-sm font-semibold text-white ring-1 ring-white/15">
            AIC
          </div>
          <div>
            <div className="text-[17px] font-semibold tracking-tight text-white">Alshaya Investment Council</div>
            <div className="mt-0.5 text-[10px] uppercase tracking-[0.28em] text-slate-400">
              Strategic Technology Investments
            </div>
          </div>
        </header>

        <div className="mt-24 max-w-[560px] xl:mt-28">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.2em] text-slate-300 backdrop-blur">
            <Sparkles className="h-3.5 w-3.5 text-blue-300" />
            Enterprise investment governance
          </div>

          <h1 className="mt-8 text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-white xl:text-[64px]">
            Make capital decisions
            <br />
            with clarity<span className="text-blue-400">.</span>
          </h1>

          <p className="mt-6 max-w-[500px] text-[17px] leading-7 text-slate-300">
            Minimal, executive-grade workspace for intake, scoring, decision, and audit visibility.
          </p>

          <div className="mt-10 space-y-6">
            <Feature number="01" title="Decision-focused review cockpit" desc="Fast scan of queue, scores, risks, and actions needed now." />
            <Feature number="02" title="Structured stage-gate governance" desc="Explicit exit criteria and release control across initiative lifecycle." />
            <Feature number="03" title="Audit-ready transparency" desc="Role-based approvals, rationale, and timeline history in one workspace." />
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <TrustChip icon={Building2} label="Microsoft Entra ID" />
            <TrustChip icon={Lock} label="RBAC & PDPL aligned" />
            <TrustChip icon={ShieldCheck} label="Full audit trail" />
          </div>
        </div>

        <footer className="mt-auto flex items-center justify-between pt-10 text-xs text-slate-500">
          <span>v3.0 · Internal Confidential</span>
          <span>© 2026 Alshaya Group</span>
        </footer>
      </div>
    </section>
  );
}
