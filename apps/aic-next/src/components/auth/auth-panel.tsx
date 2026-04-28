"use client";

import { useMemo, useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  ClipboardCheck,
  Landmark,
  Loader2,
  ShieldCheck,
  UserCog
} from "lucide-react";
import { TrustChip } from "@/components/auth/trust-chip";
import { WorkspaceCard } from "@/components/auth/workspace-card";

const workspaces = [
  {
    title: "Initiator",
    name: "Dina Al-Saleh",
    description: "Create and submit new investment initiatives.",
    icon: BriefcaseBusiness,
    accent: "from-blue-500/15 to-indigo-500/10"
  },
  {
    title: "Strategy Reviewer",
    name: "Sarah Al-Rashidi",
    description: "Score initiatives and run structured review workflows.",
    icon: ClipboardCheck,
    accent: "from-violet-500/15 to-fuchsia-500/10"
  },
  {
    title: "Investment Committee",
    name: "Faisal Al-Tamimi",
    description: "Approve, reject, or veto high-value initiatives.",
    icon: Landmark,
    accent: "from-cyan-500/15 to-sky-500/10"
  },
  {
    title: "Platform Admin",
    name: "Khalid Al-Mansouri",
    description: "Manage roles, users, logs, and governance controls.",
    icon: UserCog,
    accent: "from-emerald-500/15 to-teal-500/10"
  }
] as const;

const EMAIL_PATTERN = /^[a-zA-Z0-9._%+-]+@alshaya\.com$/i;

export function AuthPanel() {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState(false);
  const [entraLoading, setEntraLoading] = useState(false);
  const emailIsValid = useMemo(() => EMAIL_PATTERN.test(email.trim()), [email]);
  const showEmailError = touched && email.length > 0 && !emailIsValid;

  function handleEntraSignIn() {
    setEntraLoading(true);
    setTimeout(() => setEntraLoading(false), 1200);
  }

  return (
    <section className="relative flex items-center justify-center px-5 py-8 sm:px-8 lg:px-10 dark:bg-slate-950">
      <div className="w-full max-w-[520px]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm sm:p-8 dark:border-slate-800 dark:bg-slate-900">
          <header className="mb-8">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:hidden dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 text-xs font-semibold text-white">
                  AIC
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">Alshaya Investment Council</div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-slate-500">Strategic Technology Investments</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <TrustChip icon={Building2} label="Microsoft Entra ID" tone="panel" />
                <TrustChip icon={ShieldCheck} label="Full audit trail" tone="panel" />
              </div>
            </div>

            <h2 className="mt-4 text-[32px] font-semibold tracking-[-0.03em] text-slate-950 dark:text-white">
              Sign in to AIC Portal
            </h2>
            <p className="mt-2 max-w-[420px] text-sm leading-6 text-slate-500 dark:text-slate-400">
              Use your corporate identity, or open a role workspace profile.
            </p>
          </header>

          <button
            type="button"
            onClick={handleEntraSignIn}
            disabled={entraLoading}
            aria-label="Continue with Microsoft Entra ID"
            className="inline-flex h-12 w-full items-center justify-center gap-3 rounded-2xl bg-[#171717] px-4 text-sm font-medium text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {entraLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span aria-hidden="true">▦</span>}
            {entraLoading ? "Connecting..." : "Continue with Microsoft Entra ID"}
          </button>

          <div className="mt-5">
            <label
              htmlFor="corp-email"
              className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400"
            >
              Corporate Email
            </label>
            <input
              id="corp-email"
              type="email"
              name="corp-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="firstname.lastname@alshaya.com"
              aria-invalid={showEmailError}
              aria-describedby="corp-email-help corp-email-error"
              className={`h-12 w-full rounded-2xl border px-4 text-sm outline-none transition placeholder:text-slate-400 focus-visible:ring-4 focus-visible:ring-blue-50 dark:bg-slate-950 dark:text-slate-100 ${
                showEmailError
                  ? "border-red-300 bg-red-50 focus-visible:border-red-500"
                  : "border-slate-200 bg-slate-50 focus-visible:border-blue-500"
              }`}
            />
            <p id="corp-email-help" className="mt-2 text-xs text-slate-400">
              SSO is restricted to verified Alshaya tenants.
            </p>
            {showEmailError ? (
              <p id="corp-email-error" className="mt-1 text-xs text-red-600">
                Enter a valid corporate email ending with @alshaya.com.
              </p>
            ) : null}
          </div>

          <div className="my-6 flex items-center gap-4" role="separator" aria-label="Workspace divider">
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-400">Or open a workspace</span>
            <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
          </div>

          <div className="mb-3 flex items-center justify-between">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Role Workspaces
            </div>
            <button
              type="button"
              aria-label="Reset demo workspace data"
              className="min-h-11 text-xs font-medium text-slate-500 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Reset demo data
            </button>
          </div>

          <div className="space-y-3" aria-label="Available role workspaces">
            {workspaces.map((workspace) => (
              <WorkspaceCard key={workspace.title} {...workspace} />
            ))}
          </div>

          <p className="mt-5 text-xs leading-5 text-slate-400">
            Demo mode uses local browser storage only. No data leaves your device.
          </p>

          <footer className="mt-6 flex items-center justify-between border-t border-slate-200 pt-5 text-xs text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <div className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              Encrypted in transit
            </div>
            <a
              href="mailto:aic-support@alshaya.com"
              className="min-h-11 font-medium text-slate-700 hover:text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:text-white"
              aria-label="Contact AIC support"
            >
              Need access?
            </a>
          </footer>
        </div>
      </div>
    </section>
  );
}
