"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { navByRole } from "@/lib/nav";
import { UserRole } from "@/lib/types";

export function AppSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const items = navByRole[role];

  return (
    <aside
      className={`h-screen border-r transition-all duration-200 ${collapsed ? "w-[88px]" : "w-[260px]"}`}
      style={{ background: "var(--sidebar)", borderColor: "rgba(255,255,255,.08)" }}
    >
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 text-sm font-semibold text-white">AIC</div>
          {!collapsed ? (
            <div>
              <div className="text-sm font-semibold text-white">Investment Council</div>
              <div className="text-xs text-slate-400">Governance Platform</div>
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="rounded-xl p-2 text-slate-300 hover:bg-white/10"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
      </div>

      <nav className="px-3 py-4">
        <div className="mb-3 px-3 text-[11px] uppercase tracking-[0.16em] text-slate-500">
          {collapsed ? "" : "Workspace"}
        </div>
        <div className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition ${
                  active ? "text-white" : "text-slate-300 hover:bg-white/5"
                }`}
                style={active ? { background: "var(--sidebar-active-bg)" } : {}}
              >
                <Icon size={18} />
                {!collapsed ? (
                  <>
                    <span className="flex-1">{item.label}</span>
                    {active ? <ChevronRight size={16} /> : null}
                  </>
                ) : null}
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
