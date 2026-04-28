import { AuthPanel } from "@/components/auth/auth-panel";
import { HeroPanel } from "@/components/auth/hero-panel";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950 dark:bg-slate-950 dark:text-slate-100">
      <div className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
        <HeroPanel />
        <AuthPanel />
      </div>
    </main>
  );
}
