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

    const navItems = [
        { label: "Dashboard",   icon: Icons.Dashboard, key: ROUTES.JOCKEY_DASHBOARD },
        { label: "Schedule",    icon: Icons.Calendar,  key: ROUTES.JOCKEY_SCHEDULE },
        { label: "Invitations", icon: Icons.Mail,      key: ROUTES.JOCKEY_INVITATIONS, badge: pendingCount },
    ];

    const activePath = activeKey || location.pathname;
    const activeLabel = navItems.find((n) => n.key === activePath)?.label ?? "Portal";

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
                {/* Fixed container filling parent space with no overflow */}
                <div className="flex h-full w-full overflow-hidden relative bg-[#F4F6F5] text-slate-800 font-body">
                    
                    <style dangerouslySetInnerHTML={{__html: `
                        @import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesk:ital,wght@0,100..900;1,100..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=JetBrains+Mono:wght@400;500;700&display=swap');
                        
                        .font-headline {
                            font-family: 'Playfair Display', Georgia, serif;
                        }
                        .font-body {
                            font-family: 'Hanken Grotesk', system-ui, -apple-system, sans-serif;
                            letter-spacing: -0.011em;
                        }
                        .font-label {
                            font-family: 'JetBrains Mono', monospace;
                        }
                    `}} />

                    {/* Deep Emerald Sidebar - set to h-full and non-scrollable */}
                    <Sidebar collapsible="none" className="!static self-stretch border-r border-[#064E3B]/10 shrink-0 bg-[#064E3B] text-slate-100 h-full overflow-hidden z-20">
                        <SidebarContent className="py-4">
                            <SidebarGroup>
                                <SidebarGroupLabel className="px-3 text-slate-350 text-[10px] uppercase font-black tracking-widest mb-3 font-body">
                                    Jockey Operations
                                </SidebarGroupLabel>
                                <SidebarMenu className="space-y-1.5 px-2">
                                    {navItems.map((item) => (
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

                    {/* Main content - locked height to prevent parent container scroll */}
                    <main className="flex-1 flex flex-col min-w-0 bg-[#F4F6F5] h-full overflow-hidden">
                        {/* Static label bar */}
                        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#064E3B]/10 px-6 bg-white shadow-sm z-10">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <span className="font-headline text-[#064E3B] text-sm">Elite Turf Registry</span>
                                <span className="text-slate-400"><Icons.ChevronRight /></span>
                                <span className="font-body text-[#1E293B] font-bold">{activeLabel}</span>
                            </div>
                        </div>

                        {/* Content viewport area */}
                        <div className="flex-1 min-h-0 h-full overflow-hidden relative flex flex-col">
                            {children || <Outlet />}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}