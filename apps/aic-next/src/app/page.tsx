import Link from "next/link";

export default function HomePage() {
  return (
    <main className="grid min-h-screen place-items-center bg-aic-bg p-8">
      <section className="w-full max-w-2xl rounded-2xl border border-aic-border bg-aic-surface p-8 text-center">
        <h1 className="text-2xl font-semibold text-aic-text">Alshaya Investment Council</h1>
        <p className="mt-2 text-sm text-aic-muted">
          Premium sign-in and dynamic role workspaces are ready.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/sign-in" className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white">
            Open Sign-In
          </Link>
          <Link
            href="/workspace/investment_committee"
            className="rounded-xl border border-aic-border px-4 py-2 text-sm text-aic-text"
          >
            Open Workspace
          </Link>
        </div>
      </section>
    </main>
  );
}
