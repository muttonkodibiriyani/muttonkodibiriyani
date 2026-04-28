import {
  BriefcaseBusiness,
  ClipboardCheck,
  FilePlus2,
  Landmark,
  LayoutDashboard,
  ScrollText,
  Settings,
  ShieldCheck,
  Users
} from "lucide-react";
import { UserRole } from "@/lib/types";

export const navByRole: Record<UserRole, { label: string; href: string; icon: any }[]> = {
  Initiative_Submitter: [
    { label: "Dashboard", href: "/initiator/dashboard", icon: LayoutDashboard },
    { label: "New Initiative", href: "/initiator/new", icon: FilePlus2 },
    { label: "My Initiatives", href: "/initiatives/INV-2026-0041", icon: BriefcaseBusiness }
  ],
  Strategy_Reviewer: [
    { label: "Dashboard", href: "/strategy/dashboard", icon: LayoutDashboard },
    { label: "Review Queue", href: "/initiatives/INV-2026-0041", icon: ClipboardCheck },
    { label: "Portfolio", href: "/workspace/strategy_reviewer", icon: BriefcaseBusiness }
  ],
  Investment_Committee: [
    { label: "Dashboard", href: "/committee/dashboard", icon: LayoutDashboard },
    { label: "Decision Queue", href: "/initiatives/INV-2026-0041", icon: Landmark },
    { label: "Portfolio", href: "/workspace/investment_committee", icon: BriefcaseBusiness }
  ],
  Platform_Admin: [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Users", href: "/admin", icon: Users },
    { label: "Audit Logs", href: "/admin", icon: ScrollText },
    { label: "Policies", href: "/admin", icon: ShieldCheck },
    { label: "Settings", href: "/admin", icon: Settings }
  ]
};
