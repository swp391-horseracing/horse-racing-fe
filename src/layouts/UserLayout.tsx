import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Mail,
  TrendingUp,
  Activity,
  UserCheck,
  ClipboardList,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "../components/ui/sidebar";
import { TooltipProvider } from "../components/ui/tooltip";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import { useInvitations } from "../hooks/useInvitations.ts";

// ─── Inline Custom Horse Icon Fallback ────────────────────────────────────────
const HorseIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 16v4h3l1-4" />
    <path d="M10 16v4h3l1-4" />
    <path d="M2 12c0-2 1-3 3-4l2-1c1-3 3-5 7-5 2 0 4 1 5 3l1 2h1c1 0 1 1 1 2v2c0 1-1 2-2 2h-1l-1 2H7l-1-2H5c-2 0-3-1-3-3z" />
  </svg>
);

// ─── Type Definitions ────────────────────────────────────────────────────────
type NavItem = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  key: string;
  badge?: number;
};

interface UserLayoutProps {
  children?: React.ReactNode;
  activeKey?: string;
  onActiveKeyChange?: (key: string) => void;
}

export default function UserLayout({
  children,
  activeKey,
  onActiveKeyChange,
}: UserLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { invitations } = useInvitations();

  const pendingCount =
    invitations?.filter((i) => i.status === "Pending").length || 0;

  // Detect role context based on routing path prefix
  const path = location.pathname.toLowerCase();
  let currentRole: "Jockey" | "Owner" | "Spectator" | "Admin" = "Jockey";
  let sidebarGroupLabel = "Jockey Operations";

  if (path.includes("/owner")) {
    currentRole = "Owner";
    sidebarGroupLabel = "Owner Operations";
  } else if (path.includes("/spectator")) {
    currentRole = "Spectator";
    sidebarGroupLabel = "Spectator Arena";
  } else if (path.includes("/admin")) {
    currentRole = "Admin";
    sidebarGroupLabel = "Admin Controls";
  }

  // Role-based Nav configurations
  const navConfigurations: Record<
    "Jockey" | "Owner" | "Spectator" | "Admin",
    NavItem[]
  > = {
    Jockey: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        key: ROUTES.JOCKEY_DASHBOARD,
      },
      { label: "My Rides", icon: Calendar, key: ROUTES.JOCKEY_SCHEDULE },
      {
        label: "Invitations",
        icon: Mail,
        key: ROUTES.JOCKEY_INVITATIONS,
        badge: pendingCount,
      },
    ],
    Owner: [
      {
        label: "Dashboard",
        icon: LayoutDashboard,
        key: ROUTES.OWNER_DASHBOARD,
      },
      {
        label: "Horse Management",
        icon: HorseIcon,
        key: "/owner/horseManagement",
      },
      {
        label: "Race Registration",
        icon: ClipboardList,
        key: "/owner/raceRegister",
      },
      { label: "Jockey Roster", icon: UserCheck, key: "/owner/jockeys" },
      { label: "Horse Schedule", icon: Calendar, key: "/owner/schedule" },
    ],
    Spectator: [
      {
        label: "Arena Overview",
        icon: LayoutDashboard,
        key: ROUTES.SPECTATOR_DASHBOARD,
      },
      {
        label: "Predictions Hub",
        icon: Activity,
        key: "/spectator/predictions",
      },
    ],
    Admin: [
      {
        label: "Control Center",
        icon: LayoutDashboard,
        key: ROUTES.ADMIN_DASHBOARD,
      },
      { label: "Access Management", icon: UserCheck, key: "/admin/access" },
      { label: "Registry & Approvals", icon: Mail, key: "/admin/registry" },
      {
        label: "Tournaments & Races",
        icon: Calendar,
        key: "/admin/tournaments",
      },
      { label: "Virtual Economy", icon: TrendingUp, key: "/admin/economy" },
    ],
  };

  const currentNav = navConfigurations[currentRole];

  // Safely handles exact matching, or falls back to 'Dashboard' as the default label
  const activePath = activeKey || location.pathname;
  const activeLabel =
    currentNav.find(
      (n) => activePath === n.key || activePath.startsWith(n.key + "/")
    )?.label ?? "Portal";

  const handleNavigation = (key: string) => {
    if (onActiveKeyChange) {
      onActiveKeyChange(key);
    } else {
      navigate(key);
    }
  };

  return (
    <TooltipProvider>
      <SidebarProvider className="!min-h-0 !h-full w-full overflow-hidden flex">
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap');
              .font-headline { font-family: 'Playfair Display', Georgia, serif; }
              .font-body { font-family: 'Hanken Grotesk', system-ui, -apple-system, sans-serif; letter-spacing: -0.011em; }
              .font-label { font-family: 'JetBrains Mono', monospace; }
          `,
          }}
        />

        {/* Dynamic Sidebar */}
        <Sidebar
          collapsible="none"
          className="!static self-stretch border-r border-[#064E3B]/10 shrink-0 bg-[#064E3B] text-slate-100 h-full overflow-hidden z-20"
        >
          <SidebarContent className="py-4">
            <SidebarGroup>
              <SidebarGroupLabel className="px-3 text-slate-350 text-[10px] uppercase font-black tracking-widest mb-3 font-body">
                {sidebarGroupLabel}
              </SidebarGroupLabel>
              <SidebarMenu className="space-y-1.5 px-2">
                {currentNav.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activePath === item.key;

                  return (
                    <SidebarMenuItem key={item.key}>
                      <SidebarMenuButton
                        isActive={isActive}
                        onClick={() => handleNavigation(item.key)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 font-body",
                          isActive
                            ? "bg-[#EAB308] text-[#064E3B] font-extrabold shadow-md"
                            : "hover:bg-[#043E2F] text-slate-200 hover:text-white"
                        )}
                      >
                        <IconComponent className="w-4 h-4 shrink-0" />
                        <span>{item.label}</span>
                      </SidebarMenuButton>
                      {item.badge !== undefined && item.badge > 0 && (
                        <SidebarMenuBadge className="bg-[#EAB308] text-[#064E3B] font-black px-2 py-0.5 text-[9px] rounded-full mr-2 font-label">
                          {item.badge}
                        </SidebarMenuBadge>
                      )}
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        {/* Main content viewport */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F4F6F5] h-full overflow-hidden">
          {/* Header Bar using Custom Breadcrumb components */}
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#064E3B]/10 px-6 bg-white shadow-sm z-10">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink className="font-headline text-[#064E3B] text-sm hover:text-[#043E2F] transition-colors cursor-pointer">
                      {currentRole}
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="font-body text-[#1E293B] font-bold">
                      {activeLabel}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

          <div className="flex-1 relative min-h-0">
            <div className="absolute inset-0 flex flex-col overflow-hidden pb-4">
              {children || <Outlet />}
            </div>
          </div>
        </main>
      </SidebarProvider>
    </TooltipProvider>
  );
}