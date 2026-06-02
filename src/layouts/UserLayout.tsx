// src/layouts/UserLayout.tsx
import React from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
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
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import { useInvitations } from "../hooks/useInvitations.ts";

// ─── Shared Layout Icons ───────────────────────────────────────────────────
const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
            <rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>
        </svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),
    Mail: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
        </svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <polyline points="9 18 15 12 9 6"/>
        </svg>
    ),
    Horse: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M4 16v4h3l1-4"/><path d="M10 16v4h3l1-4"/><path d="M2 12c0-2 1-3 3-4l2-1c1-3 3-5 7-5 2 0 4 1 5 3l1 2h1c1 0 1 1 1 2v2c0 1-1 2-2 2h-1l-1 2H7l-1-2H5c-2 0-3-1-3-3z"/>
        </svg>
    ),
    Trophy: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
        </svg>
    ),
    TrendingUp: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
        </svg>
    ),
    Activity: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
    ),
    UserCheck: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>
        </svg>
    ),
    Lock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    )
};

interface UserLayoutProps {
    children?: React.ReactNode;
    activeKey?: string;
    onActiveKeyChange?: (key: string) => void;
}

export default function UserLayout({ children, activeKey, onActiveKeyChange }: UserLayoutProps) {
    const navigate = useNavigate();
    const location = useLocation();
    const { invitations } = useInvitations();

    const pendingCount = invitations?.filter((i) => i.status === "Pending").length || 0;

    // Detect role context based on routing path prefix
    const path = location.pathname.toLowerCase();
    let currentRole: "Jockey" | "Owner" | "Spectator" | "Admin" = "Jockey";
    let sidebarGroupLabel = "Jockey Operations";

    if (path.includes("/owner")) {
        currentRole = "Owner";
        sidebarGroupLabel = "Owner Operations";
    } else if (path.includes("/spectator")) {
        currentRole = "Spectator";
        sidebarGroupLabel = "Spectator Operations";
    } else if (path.includes("/admin")) {
        currentRole = "Admin";
        sidebarGroupLabel = "Admin Controls";
    }

    // Role-based Nav configurations
    const navConfigurations = {
        Jockey: [
            { label: "Dashboard",   icon: Icons.Dashboard, key: ROUTES.JOCKEY_DASHBOARD },
            { label: "Schedule",    icon: Icons.Calendar,  key: ROUTES.JOCKEY_SCHEDULE },
            { label: "Invitations", icon: Icons.Mail,      key: ROUTES.JOCKEY_INVITATIONS, badge: pendingCount },
        ],
        Owner: [
            { label: "Dashboard",   icon: Icons.Dashboard, key: ROUTES.OWNER_DASHBOARD },
            { label: "My Stables",  icon: Icons.Horse,     key: "/owner/stable" },
            { label: "Registries",  icon: Icons.Trophy,    key: "/owner/registry" },
        ],
        Spectator: [
            { label: "Overview",    icon: Icons.Dashboard,  key: ROUTES.SPECTATOR_DASHBOARD },
            { label: "Live Odds",   icon: Icons.TrendingUp, key: "/spectator/odds" },
            { label: "Race Stream", icon: Icons.Activity,   key: "/spectator/stream" },
        ],
        Admin: [
            { label: "Dashboard",   icon: Icons.Dashboard, key: ROUTES.ADMIN_DASHBOARD },
            { label: "Manage Users",icon: Icons.UserCheck, key: "/admin/users" },
            { label: "Security",    icon: Icons.Lock,      key: "/admin/security" },
        ]
    };

    const currentNav = navConfigurations[currentRole];
    const activePath = activeKey || location.pathname;
    const activeLabel = currentNav.find((n) => n.key === activePath)?.label ?? "Portal";

    const handleNavigation = (key: string) => {
        if (onActiveKeyChange) {
            onActiveKeyChange(key);
        } else {
            navigate(key);
        }
    };

    return (
        <TooltipProvider>
            <SidebarProvider style={{ height: "100%" }}>
                <div className="flex h-full w-full overflow-hidden relative bg-[#F4F6F5] text-slate-800 font-body">
                    
                    <style dangerouslySetInnerHTML={{__html: `
                        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap');
                        
                        .font-headline { font-family: 'Playfair Display', Georgia, serif; }
                        .font-body { font-family: 'Hanken Grotesk', system-ui, -apple-system, sans-serif; letter-spacing: -0.011em; }
                        .font-label { font-family: 'JetBrains Mono', monospace; }
                    `}} />

                    {/* Dynamic Sidebar */}
                    <Sidebar collapsible="none" className="!static self-stretch border-r border-[#064E3B]/10 shrink-0 bg-[#064E3B] text-slate-100 h-full overflow-hidden z-20">
                        <SidebarContent className="py-4">
                            <SidebarGroup>
                                <SidebarGroupLabel className="px-3 text-slate-350 text-[10px] uppercase font-black tracking-widest mb-3 font-body">
                                    {sidebarGroupLabel}
                                </SidebarGroupLabel>
                                <SidebarMenu className="space-y-1.5 px-2">
                                    {currentNav.map((item) => (
                                        <SidebarMenuItem key={item.key}>
                                            <SidebarMenuButton
                                                isActive={activePath === item.key}
                                                onClick={() => handleNavigation(item.key)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 font-body",
                                                    activePath === item.key 
                                                        ? "bg-[#EAB308] text-[#064E3B] font-extrabold shadow-md" 
                                                        : "hover:bg-[#043E2F] text-slate-200 hover:text-white"
                                                )}
                                            >
                                                <item.icon />
                                                <span>{item.label}</span>
                                            </SidebarMenuButton>
                                            {item.badge !== undefined && item.badge > 0 && (
                                                <SidebarMenuBadge className="bg-[#EAB308] text-[#064E3B] font-black px-2 py-0.5 text-[9px] rounded-full mr-2 font-label">
                                                    {item.badge}
                                                </SidebarMenuBadge>
                                            )}
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroup>
                        </SidebarContent>
                    </Sidebar>

                    {/* Main content viewport */}
                    <main className="flex-1 flex flex-col min-w-0 bg-[#F4F6F5] h-full overflow-hidden">
                        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#064E3B]/10 px-6 bg-white shadow-sm z-10">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <span className="font-headline text-[#064E3B] text-sm">Elite Turf Registry</span>
                                <span className="text-slate-400"><Icons.ChevronRight /></span>
                                <span className="font-body text-[#1E293B] font-bold">{activeLabel}</span>
                            </div>
                        </div>

                        {/* Content Render Area */}
                        <div className="flex-1 min-h-0 h-full overflow-hidden relative flex flex-col">
                            {children || <Outlet />}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}