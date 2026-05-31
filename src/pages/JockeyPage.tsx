import { useState, useMemo } from "react";
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
import { useHorseList } from "../hooks/useHorseList.ts";
import { useEvent } from "../hooks/useEvent.ts";
import { useInvitations } from "../hooks/useInvitations.ts";
import type { Invitation, InvStatus } from "../services/invitationService.ts";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
    label: string;
    icon: React.ElementType;
    key: string;
    badge?: number;
};

type FilterType = "All" | InvStatus;

type ToastType = "success" | "error" | "warning" | "info";

type Toast = {
    id: number;
    message: string;
    type: ToastType;
};

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

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
    Horse: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M4 16v4h3l1-4"/><path d="M10 16v4h3l1-4"/>
            <path d="M2 12c0-2 1-3 3-4l2-1c1-3 3-5 7-5 2 0 4 1 5 3l1 2h1c1 0 1 1 1 2v2c0 1-1 2-2 2h-1l-1 2H7l-1-2H5c-2 0-3-1-3-3z"/>
        </svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
            <polyline points="9 18 15 12 9 6"/>
        </svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
    CheckCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    ),
    XCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
    ),
    Trophy: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
            <path d="M4 22h16"/>
            <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/>
            <path d="M12 2a6 6 0 0 1 6 6v5a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z"/>
        </svg>
    ),
    TrendingUp: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
        </svg>
    ),
    Award: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <circle cx="12" cy="8" r="7"/>
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
        </svg>
    ),
    ShieldAlert: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
    ),
    UserCheck: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <polyline points="17 11 19 13 23 9"/>
        </svg>
    ),
    Search: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
    ),
    Activity: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
    ),
    Lock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
    ),
    Compass: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <circle cx="12" cy="12" r="10"/>
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
        </svg>
    ),
    Check: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="20 6 9 17 4 12"/>
        </svg>
    ),
    Trash: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
        </svg>
    )
};

// ─── Status Config ────────────────────────────────────────────────────────────

const statusConfig: Record<InvStatus, { color: string; bg: string; border: string; Icon: React.ElementType; label: string }> = {
    Pending:    { color: "text-[#D97706]", bg: "bg-[#D97706]/10", border: "border-[#D97706]/20",       Icon: Icons.Clock,       label: "Pending"    },
    Accepted:   { color: "text-[#064E3B]", bg: "bg-[#064E3B]/10", border: "border-[#064E3B]/20", Icon: Icons.CheckCircle, label: "Accepted"   },
    Declined:   { color: "text-rose-700", bg: "bg-rose-500/10", border: "border-rose-500/20",             Icon: Icons.XCircle,     label: "Declined"   },
    Expired:    { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20",          Icon: Icons.Clock,       label: "Expired"    },
    Cancelled:  { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20",          Icon: Icons.XCircle,     label: "Cancelled"  },
    Superseded: { color: "text-slate-500", bg: "bg-slate-500/10", border: "border-slate-500/20",          Icon: Icons.XCircle,     label: "Superseded" },
};

export default function JockeyPage() {
    const [active, setActive] = useState<string>(ROUTES.JOCKEY_INVITATIONS);
    const [toasts, setToasts] = useState<Toast[]>([]);
    
    // Shared hooks data
    const { horseList } = useHorseList();
    const { eventList } = useEvent();
    const { invitations, updateInvitationStatus } = useInvitations();

    // Simulator states
    const [deadlinePassedSim, setDeadlinePassedSim] = useState(false);
    const [concurrencyConflictSim, setConcurrencyConflictSim] = useState(false);
    const [selectedInvId, setSelectedInvId] = useState<number | null>(1);

    // Toast triggers
    const addToast = (message: string, type: ToastType = "success") => {
        const id = Date.now() + Math.random();
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    };

    const pendingCount = invitations.filter((i) => i.status === "Pending").length;

    // Jockey Navigation menu
    const jockeyNav: NavItem[] = [
        { label: "Dashboard",   icon: Icons.Dashboard, key: ROUTES.JOCKEY_DASHBOARD },
        { label: "Schedule",    icon: Icons.Calendar,  key: ROUTES.JOCKEY_SCHEDULE },
        { label: "Invitations", icon: Icons.Mail,      key: ROUTES.JOCKEY_INVITATIONS, badge: pendingCount },
    ];

    const activeLabel = jockeyNav.find((n) => n.key === active)?.label ?? "Portal";

    // ─── Actions handlers ─────────────────────────────────────────────────────

    const handleAcceptInvitation = (id: number) => {
        if (deadlinePassedSim) {
            updateInvitationStatus(id, "Expired");
            addToast("This invitation has expired due to the tournament registration deadline.", "error");
            return;
        }

        if (concurrencyConflictSim) {
            updateInvitationStatus(id, "Cancelled");
            addToast("This offer is no longer available. (Concurrency Conflict: Horse Owner confirmed another rider).", "warning");
            return;
        }

        const target = invitations.find(inv => inv.id === id);
        updateInvitationStatus(id, "Accepted");
        addToast(`Response recorded successfully! Tentatively registered to ride ${target?.horse}. Awaiting final Owner confirmation.`, "success");
    };

    const handleDeclineInvitation = (id: number) => {
        if (deadlinePassedSim) {
            updateInvitationStatus(id, "Expired");
            addToast("This invitation has expired due to the registration deadline.", "error");
            return;
        }

        const target = invitations.find(inv => inv.id === id);
        updateInvitationStatus(id, "Declined");
        addToast(`You declined the invitation to ride ${target?.horse}. Deep access revoked.`, "info");
    };

    const renderContent = () => {
        switch (active) {
            case ROUTES.JOCKEY_DASHBOARD:   
                return (
                    <DashboardOverview 
                        data={invitations} 
                        setActiveTab={(tab) => setActive(tab)} 
                        horseList={horseList}
                    />
                );
            case ROUTES.JOCKEY_SCHEDULE:    
                return <RidingSchedule data={invitations} eventList={eventList} />;
            case ROUTES.JOCKEY_INVITATIONS: 
                return (
                    <InvitationsView 
                        data={invitations}
                        selectedId={selectedInvId}
                        setSelectedId={setSelectedInvId}
                        onAccept={handleAcceptInvitation}
                        onDecline={handleDeclineInvitation}
                        deadlinePassedSim={deadlinePassedSim}
                        setDeadlinePassedSim={setDeadlinePassedSim}
                        concurrencyConflictSim={concurrencyConflictSim}
                        setConcurrencyConflictSim={setConcurrencyConflictSim}
                    />
                );
            default:                        
                return null;
        }
    };

    return (
        <TooltipProvider>
            <SidebarProvider style={{ height: "100%" }}>
                {/* Root container: min-h-screen expands with content and allows scroll when zoomed */}
                <div className="flex h-full w-full overflow-x-hidden relative bg-[#F4F6F5] text-slate-800 font-body">
                    
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

                    {/* Floating Toasts container */}
                    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none font-body">
                        {toasts.map((t) => (
                            <div 
                                key={t.id} 
                                className={cn(
                                    "p-4 rounded-xl border shadow-2xl backdrop-blur-md flex items-start gap-3 pointer-events-auto transform animate-in slide-in-from-top duration-300",
                                    t.type === "success" && "bg-emerald-50 border-emerald-300 text-emerald-900",
                                    t.type === "error" && "bg-rose-50 border-rose-300 text-rose-900",
                                    t.type === "warning" && "bg-amber-50 border-amber-300 text-amber-900",
                                    t.type === "info" && "bg-indigo-50 border-indigo-300 text-indigo-900"
                                )}
                            >
                                <span className={cn(
                                    "mt-0.5 shrink-0",
                                    t.type === "success" && "text-emerald-700",
                                    t.type === "error" && "text-rose-700",
                                    t.type === "warning" && "text-amber-700",
                                    t.type === "info" && "text-indigo-700"
                                )}>
                                    {t.type === "success" && <Icons.CheckCircle />}
                                    {t.type === "error" && <Icons.XCircle />}
                                    {t.type === "warning" && <Icons.ShieldAlert />}
                                    {t.type === "info" && <Icons.Activity />}
                                </span>
                                <div className="flex-1 text-xs font-semibold">{t.message}</div>
                            </div>
                        ))}
                    </div>

                    {/* Elite Turf Deep Emerald Sidebar — sticky, full viewport height */}
                    <Sidebar collapsible="none" className="!static self-stretch border-r border-[#064E3B]/10 shrink-0 bg-[#064E3B] text-slate-100">
                        {/* Logo header elements removed as requested */}
                        <SidebarContent className="py-4">
                            <SidebarGroup>
                                <SidebarGroupLabel className="px-3 text-slate-350 text-[10px] uppercase font-black tracking-widest mb-3 font-body">Jockey Operations</SidebarGroupLabel>
                                <SidebarMenu className="space-y-1.5 px-2">
                                    {jockeyNav.map((item) => (
                                        <SidebarMenuItem key={item.key}>
                                            <SidebarMenuButton
                                                isActive={active === item.key}
                                                onClick={() => setActive(item.key)}
                                                className={cn(
                                                    "w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 font-body",
                                                    active === item.key 
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

                    {/* Main content — grows to fill width, scrolls independently */}
                    <main className="flex-1 flex flex-col min-w-0 bg-[#F4F6F5]">
                        
                        {/* Context-driven Top bar */}
                        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#064E3B]/10 px-6 bg-white shadow-sm sticky top-0 z-10">
                            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                                <span className="font-headline text-[#064E3B] text-sm">Elite Turf Registry</span>
                                <span className="text-slate-400"><Icons.ChevronRight /></span>
                                <span className="font-body text-[#1E293B] font-bold">{activeLabel}</span>
                            </div>
                        </div>

                        {/* Layout Inner Content — handles scrolling naturally for child views */}
                        <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}

// ─── Component 1: DashboardOverview ──────────────────────────────────────────

function DashboardOverview({ 
    data, 
    setActiveTab,
    horseList
}: { 
    data: Invitation[]; 
    setActiveTab: (k: string) => void;
    horseList: any[];
}) {
    const pendingInvites = data.filter(inv => inv.status === "Pending");
    const activeRaces = data.filter(inv => inv.status === "Accepted");

    return (
        <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-body">
            {/* Welcoming Dashboard Grid Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Stats 1: Win Rate */}
                <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
                    <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#064E3B]">
                        <Icons.Trophy />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">Jockey Win Rate</span>
                        <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
                            <Icons.Trophy />
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">33.3%</span>
                        <span className="text-xs text-emerald-700 font-bold flex items-center gap-0.5">
                            ▲ +2.4%
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-body font-medium">Ranked #14 of 120 Pro Jockeys</p>
                </div>

                {/* Stats 2: Total Earnings */}
                <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
                    <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#D97706]">
                        <Icons.TrendingUp />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">Total Earnings</span>
                        <span className="p-2 rounded-xl bg-[#D97706]/10 text-[#D97706]">
                            <Icons.TrendingUp />
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">$142,500</span>
                        <span className="text-xs text-slate-500 font-semibold font-body">
                            (70% Owner split)
                        </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 font-body font-medium">84 Career Turf Starts (28 Wins, 18 Seconds)</p>
                </div>

                {/* Stats 3: Inbound Invites */}
                <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 relative group overflow-hidden shadow-sm">
                    <div className="absolute right-0 bottom-0 translate-y-4 translate-x-4 opacity-5 group-hover:scale-110 duration-500 text-[#064E3B]">
                        <Icons.Mail />
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-slate-500 font-bold text-xs tracking-wider uppercase">Ride Invitations</span>
                        <span className="p-2 rounded-xl bg-[#064E3B]/10 text-[#064E3B]">
                            <Icons.Mail />
                        </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-black font-headline text-[#064E3B] tracking-tight">{pendingInvites.length} Pending</span>
                        {pendingInvites.length > 0 && (
                            <span className="animate-pulse h-2.5 w-2.5 rounded-full bg-[#D97706]"></span>
                        )}
                    </div>
                    <p className="text-xs text-[#D97706] font-bold mt-2 hover:underline cursor-pointer" onClick={() => setActiveTab(ROUTES.JOCKEY_INVITATIONS)}>
                        Inspect pending owner offers →
                    </p>
                </div>
            </div>

            {/* Performance Graphs / Charts Mock and Leaderboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Visual Chart - pure CSS & SVG representation of Win Rate per month */}
                <div className="lg:col-span-2 bg-white border border-[#064E3B]/10 rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h3 className="font-bold font-headline text-lg text-[#064E3B]">Win Rate Performance Trend</h3>
                            <p className="text-xs text-slate-500 font-medium">Turf win percentages for the past 5 months</p>
                        </div>
                        <div className="flex gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold bg-[#064E3B]/10 text-[#064E3B] border border-[#064E3B]/20">
                                2026 Season
                            </span>
                        </div>
                    </div>

                    {/* SVG Line Graph */}
                    <div className="h-64 relative flex flex-col justify-between">
                        <div className="absolute inset-0 grid grid-rows-4 pointer-events-none">
                            {[75, 50, 25, 0].map((val) => (
                                <div key={val} className="border-t border-slate-100 text-[9px] font-label text-slate-400 pt-1 flex items-start">
                                    {val}%
                                </div>
                            ))}
                        </div>
                        
                        <div className="w-full h-48 mt-4 relative">
                            <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200">
                                <defs>
                                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#064E3B" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#064E3B" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                {/* Area under line */}
                                <path 
                                    d="M 40,180 L 40,150 Q 160,130 280,95 T 520,40 L 520,180 Z" 
                                    fill="url(#chartGradient)"
                                />
                                {/* Trend Line */}
                                <path 
                                    d="M 40,150 Q 160,130 280,95 T 520,40" 
                                    fill="none" 
                                    stroke="#064E3B" 
                                    strokeWidth="3.5" 
                                    strokeLinecap="round"
                                />
                                {/* Perfectly Round Dot Indicators */}
                                <circle cx="40" cy="150" r="6" fill="#EAB308" stroke="#064E3B" strokeWidth="2.5" />
                                <circle cx="160" cy="130" r="6" fill="#EAB308" stroke="#064E3B" strokeWidth="2.5" />
                                <circle cx="280" cy="95" r="6" fill="#EAB308" stroke="#064E3B" strokeWidth="2.5" />
                                <circle cx="400" cy="68" r="6" fill="#EAB308" stroke="#064E3B" strokeWidth="2.5" />
                                <circle cx="520" cy="40" r="6" fill="#EAB308" stroke="#064E3B" strokeWidth="2.5" />
                            </svg>
                        </div>
                        
                        {/* Month markers */}
                        <div className="flex justify-between text-xs text-slate-500 font-bold px-4">
                            <span>Jan</span>
                            <span>Feb</span>
                            <span>Mar</span>
                            <span>Apr</span>
                            <span>May (Now)</span>
                        </div>
                    </div>
                </div>

                {/* Regional Standings - Using horseList from useHorseList */}
                <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
                    <div>
                        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                            <h3 className="font-bold text-md font-headline text-[#064E3B] flex items-center gap-2">
                                <span className="text-[#D97706]"><Icons.Award /></span>
                                Registry Standings
                            </h3>
                            <span className="text-[9px] font-label text-slate-400 font-bold uppercase">Performance</span>
                        </div>

                        <div className="space-y-2.5">
                            {horseList.map((horse, idx) => (
                                <div 
                                    key={horse.id} 
                                    className="flex items-center justify-between p-2.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-slate-200 transition"
                                >
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="text-xs font-black w-5 text-center block font-label text-slate-400">
                                            #{idx + 1}
                                        </span>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs truncate text-slate-700 font-semibold">{horse.name}</span>
                                            <span className="text-[10px] text-slate-450 truncate">{horse.breed} • {horse.gender}</span>
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-xs font-bold text-[#064E3B] font-label block">{horse.performance}</span>
                                        <span className="text-[9px] text-slate-400 font-semibold block">{horse.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 text-[10px] font-bold text-slate-400 text-center font-label">
                        Live Registry Feed Loaded
                    </div>
                </div>
            </div>

            {/* Assigned Riding Matches & Career History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Active Riding Matches */}
                <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                        <h3 className="font-bold font-headline text-[#064E3B] text-md flex items-center gap-2">
                            <span className="text-[#064E3B]"><Icons.Calendar /></span>
                            Your Confirmed Agenda
                        </h3>
                        <span className="rounded bg-[#064E3B]/10 text-[#064E3B] font-bold px-2 py-0.5 text-[9px] uppercase border border-[#064E3B]/20 font-label">
                            {activeRaces.length} Confirmed
                        </span>
                    </div>

                    <div className="space-y-3">
                        {activeRaces.length === 0 ? (
                            <div className="text-center py-8 text-slate-450 text-xs">
                                No confirmed active races. Navigate to "Invitations" to accept incoming offers.
                            </div>
                        ) : (
                            activeRaces.map((r) => (
                                <div key={r.id} className="p-3.5 rounded-xl border border-slate-100 bg-[#F4F6F5]/40 flex items-center justify-between gap-4 shadow-sm hover:border-[#064E3B]/10 duration-200">
                                    <div>
                                        <p className="font-bold text-[#064E3B] text-sm font-headline">{r.horse}</p>
                                        <p className="text-xs text-slate-555 font-medium mt-0.5">{r.tournament}</p>
                                        <span className="text-[10px] text-[#D97706] font-bold mt-1 block">Owner: {r.owner}</span>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="inline-block text-[9px] bg-slate-150 border border-slate-200 text-slate-650 font-black px-2 py-0.5 rounded-full mb-1 font-label">
                                            Gate 5 • Turf
                                        </span>
                                        <p className="text-xs text-slate-600 font-black font-label">{r.raceTime}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Form & Recent Achievements */}
                <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold font-headline text-[#064E3B] text-md border-b border-slate-100 pb-3 mb-4 flex items-center gap-2">
                        <span className="text-[#064E3B]"><Icons.Activity /></span>
                        Active Form & Achievements
                    </h3>
                    
                    <div className="space-y-4">
                        {/* Form Indicator */}
                        <div className="p-4 rounded-xl bg-[#F4F6F5]/40 border border-slate-150 shadow-inner">
                            <span className="text-[10px] text-slate-500 block uppercase font-bold tracking-wider mb-2.5 font-label">Recent Race Finish Sequences</span>
                            <div className="flex gap-2.5">
                                {[
                                    { pos: "1st", color: "bg-[#064E3B] text-white" },
                                    { pos: "2nd", color: "bg-[#064E3B]/20 text-[#064E3B]" },
                                    { pos: "1st", color: "bg-[#064E3B] text-white" },
                                    { pos: "4th", color: "bg-slate-100 text-slate-400" },
                                    { pos: "3rd", color: "bg-[#EAB308]/20 text-[#D97706]" }
                                ].map((item, idx) => (
                                    <div 
                                        key={idx} 
                                        className={cn(
                                            "h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs tracking-tight shadow-sm border",
                                            item.color
                                        )}
                                    >
                                        {item.pos}
                                    </div>
                                ))}
                            </div>
                            <p className="text-xs text-slate-555 font-semibold mt-3">Streak status: Excellent (W-W-L-W-L)</p>
                        </div>

                        {/* Milestones list */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 border border-slate-100 bg-[#F4F6F5]/20 rounded-xl">
                                <span className="text-[#D97706] block font-bold mb-1">🏅 Golden Spur</span>
                                <p className="text-[10px] text-slate-500 leading-normal">Won 3 Consecutive Tournaments in May 2026.</p>
                            </div>
                            <div className="p-3 border border-slate-100 bg-[#F4F6F5]/20 rounded-xl">
                                <span className="text-[#064E3B] block font-bold mb-1">🛡️ Safety Mastery</span>
                                <p className="text-[10px] text-slate-500 leading-normal">No riding infractions or track fouls recorded in 12 months.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Component 2: RidingSchedule ───────────────────────────────────────────────

function RidingSchedule({ data, eventList }: { data: Invitation[]; eventList: any[] }) {
    const assignedRaces = data.filter(inv => inv.status === "Accepted");

    return (
        <div className="p-6 space-y-6 max-w-7xl w-full mx-auto font-body">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#064E3B]/10 pb-5">
                <div>
                    <h2 className="text-xl font-bold font-headline text-[#064E3B]">Racing Schedule</h2>
                    <p className="text-xs text-slate-500 font-semibold mt-1">Confirmed upcoming tournament runs and active riding assignments</p>
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Assigned Races List */}
                <div className="space-y-4">
                    <h3 className="font-bold font-headline text-[#064E3B] text-md">Your Confirmed Ride Schedule</h3>
                    {assignedRaces.length === 0 ? (
                        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 text-center text-slate-500 shadow-sm">
                            <p className="text-xs font-semibold text-slate-550">You have no upcoming confirmed rides scheduled.</p>
                        </div>
                    ) : (
                        assignedRaces.map((r, index) => (
                            <div
                                key={r.id}
                                className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 hover:border-[#064E3B]/20 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <span className="bg-[#064E3B]/10 text-[#064E3B] font-extrabold px-2 py-0.5 rounded text-[9px] border border-[#064E3B]/20 font-label">
                                            RACE #{index + 1}
                                        </span>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase font-label">Registry Confirmed</span>
                                    </div>
                                    <h4 className="text-lg font-black font-headline text-[#064E3B]">{r.horse}</h4>
                                    <p className="text-xs text-slate-555 font-semibold">{r.tournament}</p>
                                    <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                        <span>🧬 Breed: <span className="text-[#064E3B] font-semibold">{r.breed}</span></span>
                                        <span>🏇 Owner: <span className="text-[#064E3B] font-semibold">{r.owner}</span></span>
                                    </div>
                                </div>
                                <div className="border-t border-slate-100 md:border-t-0 md:border-l md:border-slate-100 pt-4 md:pt-0 md:pl-6 space-y-2.5 text-left md:text-right shrink-0">
                                    <p className="text-xs font-black font-label text-[#064E3B]">{r.raceTime}</p>
                                    <div className="flex items-center md:justify-end gap-1.5 mt-1">
                                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-600 animate-pulse"></span>
                                        <span className="text-[11px] text-[#064E3B] font-bold">Turf • 1600m Sprint</span>
                                    </div>
                                    <button className="w-full md:w-auto rounded-lg bg-[#064E3B] text-white hover:bg-[#043E2F] px-3.5 py-2 text-xs font-bold transition shadow-sm">
                                        Download Race Guide
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Right: List of Events */}
                <div className="space-y-4">
                    <h3 className="font-bold font-headline text-[#064E3B] text-md flex items-center gap-2">
                        <span>🏆</span>
                        System Race Calendar Events
                    </h3>
                    <div className="grid grid-cols-1 gap-3">
                        {eventList.map((event) => (
                            <div 
                                key={event.id} 
                                className="p-4 rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#064E3B]/20 transition"
                            >
                                <div className="flex items-start sm:items-center gap-3">
                                    <span className={cn(
                                        "h-3.5 w-3.5 rounded-full shrink-0 mt-1 sm:mt-0",
                                        event.className?.includes("bg-yellow-600") && "bg-yellow-600",
                                        event.className?.includes("bg-red-600") && "bg-red-600",
                                        event.className?.includes("bg-green-600") && "bg-green-600"
                                    )} />
                                    <div>
                                        <p className="font-bold text-slate-800 text-sm leading-snug">{event.title}</p>
                                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-medium">
                                            <span>Editable: {event.editable ? "Yes" : "No"}</span>
                                            <span>•</span>
                                            <span>Overlap: {event.overlap ? "Allowed" : "Blocked"}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right font-label text-xs font-bold text-[#064E3B] pt-2 sm:pt-0 border-t border-slate-100 sm:border-0">
                                    {event.start ? (
                                        <span>
                                            {event.start.replace("T", " ")} {event.end ? `to ${event.end.split("T")[1]}` : ""}
                                        </span>
                                    ) : (
                                        <span>{event.date}</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Component 3: InvitationsView ───────────────────────────────────────────────

function InvitationsView({
    data,
    selectedId,
    setSelectedId,
    onAccept,
    onDecline,
    deadlinePassedSim,
    setDeadlinePassedSim,
    concurrencyConflictSim,
    setConcurrencyConflictSim,
}: {
    data: Invitation[];
    selectedId: number | null;
    setSelectedId: (id: number | null) => void;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
    deadlinePassedSim: boolean;
    setDeadlinePassedSim: (v: boolean) => void;
    concurrencyConflictSim: boolean;
    setConcurrencyConflictSim: (v: boolean) => void;
}) {
    const [filter, setFilter] = useState<FilterType>("All");
    const [search, setSearch] = useState("");

    const filters: FilterType[] = ["All", "Pending", "Accepted", "Declined", "Expired"];

    const filtered = useMemo(() => {
        return data.filter((item) => {
            const matchesFilter = filter === "All" || item.status === filter;
            const matchesSearch = 
                item.horse.toLowerCase().includes(search.toLowerCase()) || 
                item.tournament.toLowerCase().includes(search.toLowerCase()) ||
                item.owner.toLowerCase().includes(search.toLowerCase());
            return matchesFilter && matchesSearch;
        });
    }, [data, filter, search]);

    const selectedInv = data.find((i) => i.id === selectedId) ?? null;
    const pendingInvites = data.filter((i) => i.status === "Pending");

    return (
        <div className="flex h-full w-full overflow-hidden font-body">
            {/* Left list panel */}
            <div className="w-96 shrink-0 border-r border-[#064E3B]/10 bg-white flex flex-col h-full overflow-hidden">
                <div className="p-4 border-b border-slate-100 space-y-3.5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <h2 className="font-bold font-headline text-[#064E3B] text-lg">Inbound Offers</h2>
                        {pendingInvites.length > 0 && (
                            <span className="rounded bg-[#EAB308]/20 text-[#D97706] font-bold px-2.5 py-0.5 text-[9px] uppercase border border-[#EAB308]/30 font-label">
                                {pendingInvites.length} Pending
                            </span>
                        )}
                    </div>

                    {/* Search bar */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                            <Icons.Search />
                        </span>
                        <input
                            type="text"
                            placeholder="Search horse, tournament, owner..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-[#F4F6F5]/50 border border-slate-200 hover:border-slate-350 focus:border-[#064E3B] rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none transition"
                        />
                    </div>

                    {/* Tabs / Filters */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                        {filters.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors",
                                    filter === f
                                        ? "bg-[#064E3B] text-white shadow-md"
                                        : "bg-[#F4F6F5] text-slate-500 hover:bg-slate-100 hover:text-slate-800"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 font-body">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm gap-2">
                            <span className="h-10 w-10 opacity-30 text-[#064E3B]"><Icons.Mail /></span>
                            <p className="font-bold text-slate-500">No invitations found</p>
                            <p className="text-xs text-slate-400 text-center px-4">There are no matching ride offers in this selection.</p>
                        </div>
                    ) : (
                        filtered.map((inv) => {
                            const cfg = statusConfig[inv.status];
                            const StatusIcon = cfg.Icon;
                            const isPending = inv.status === "Pending";
                            const isSelected = selectedId === inv.id;

                            return (
                                <div
                                    key={inv.id}
                                    onClick={() => setSelectedId(inv.id)}
                                    className={cn(
                                        "relative group flex items-start gap-3 rounded-2xl border p-4 transition-all duration-300 cursor-pointer",
                                        isSelected
                                            ? "border-[#064E3B] bg-[#064E3B]/5 shadow-md shadow-black/5"
                                            : "border-slate-200/80 bg-white hover:bg-[#F4F6F5]/50 shadow-sm"
                                    )}
                                >
                                    <div className="flex-1 min-w-0 flex flex-col">
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                            <p className="font-bold font-headline text-[#064E3B] truncate text-sm">{inv.horse}</p>
                                            <span className={cn(
                                                "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase shrink-0 font-label",
                                                cfg.color, cfg.bg, cfg.border
                                            )}>
                                                <StatusIcon />
                                                {cfg.label}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-555 font-semibold truncate">{inv.tournament}</p>
                                        
                                        <div className="flex items-center justify-between mt-3.5 text-[9px] text-slate-400 font-bold border-t border-slate-100 pt-2 pb-1 font-label">
                                            <span>Owner: {inv.owner}</span>
                                            <span>🕒 {inv.raceTime}</span>
                                        </div>
                                        
                                        {/* Deep access indicator */}
                                        {isPending && (
                                            <div className="mt-1.5">
                                                <span className="inline-block text-[8px] text-[#D97706] font-black bg-[#EAB308]/10 px-2 py-0.5 rounded border border-[#EAB308]/20 group-hover:scale-105 duration-200 font-label">
                                                    🔓 DEEP ACCESS ACTIVE
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Scenario Conflict Simulators bottom panel */}
                <div className="p-4 border-t border-slate-100 bg-[#F4F6F5]/40 space-y-3.5">
                    <h4 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 font-label">
                        <span className="text-[#064E3B]"><Icons.Compass /></span>
                        Scenario Conflict Simulators
                    </h4>
                    
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer group text-xs text-slate-650 hover:text-[#064E3B]">
                            <input 
                                type="checkbox"
                                checked={deadlinePassedSim}
                                onChange={(e) => setDeadlinePassedSim(e.target.checked)}
                                className="rounded border-slate-350 bg-white text-rose-750 focus:ring-offset-0 focus:ring-rose-500 h-4.5 w-4.5"
                            />
                            <div>
                                <span className="font-bold text-[#064E3B] block">Registration Deadline Passed</span>
                                <span className="text-[10px] text-slate-400 block leading-tight">Simulates tournament deadline lock & Expired state</span>
                            </div>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer group text-xs text-slate-650 hover:text-[#064E3B]">
                            <input 
                                type="checkbox"
                                checked={concurrencyConflictSim}
                                onChange={(e) => setConcurrencyConflictSim(e.target.checked)}
                                className="rounded border-slate-350 bg-white text-rose-750 focus:ring-offset-0 focus:ring-rose-500 h-4.5 w-4.5"
                            />
                            <div>
                                <span className="font-bold text-[#064E3B] block">Owner Concurrency Conflict</span>
                                <span className="text-[10px] text-slate-400 block leading-tight">Simulates owner booking alternative riders</span>
                            </div>
                        </label>
                    </div>
                </div>
            </div>

            {/* Right details panel */}
            <div className="flex-1 h-full overflow-hidden bg-[#F4F6F5]/30">
                <InvitationDetail 
                    inv={selectedInv} 
                    onAccept={onAccept}
                    onDecline={onDecline}
                />
            </div>
        </div>
    );
}

// ─── Component 4: InvitationDetail ───────────────────────────────────────────────

function InvitationDetail({
    inv,
    onAccept,
    onDecline,
}: {
    inv: Invitation | null;
    onAccept: (id: number) => void;
    onDecline: (id: number) => void;
}) {
    if (!inv) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-400 gap-4 p-8">
                <span className="h-16 w-16 opacity-30 text-[#064E3B]"><Icons.Mail /></span>
                <div>
                    <h3 className="font-bold text-slate-500">No Offer Selected</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm">Select an inbound invitation from the dashboard list to securely inspect race parameters and private horse records.</p>
                </div>
            </div>
        );
    }

    const cfg = statusConfig[inv.status];
    const StatusIcon = cfg.Icon;
    const isPending = inv.status === "Pending";

    return (
        <div className="p-6 h-full overflow-y-auto space-y-6 font-body">
            
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#064E3B]/10 pb-5">
                <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[9px] text-[#064E3B] font-extrabold bg-[#064E3B]/10 px-2.5 py-0.5 rounded border border-[#064E3B]/20 font-label">
                            RIDING OFFER
                        </span>
                        <span className="text-[9px] text-slate-400 font-label">ID: #0087{inv.id}</span>
                    </div>
                    <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">{inv.horse}</h2>
                    <p className="text-xs font-semibold text-slate-555 font-body">{inv.tournament}</p>
                </div>

                <span className={cn(
                    "self-start sm:self-auto inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase font-label",
                    cfg.color, cfg.bg, cfg.border
                )}>
                    <StatusIcon />
                    {cfg.label}
                </span>
            </div>

            {/* Public profile stats card */}
            <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <h3 className="text-[10px] font-bold font-headline uppercase tracking-wider text-slate-400 flex items-center gap-2">
                        <span className="text-[#064E3B]"><Icons.Horse /></span>
                        Standard Horse Profile (Public)
                    </h3>
                    <span className="text-[9px] text-[#064E3B] font-extrabold font-label bg-[#064E3B]/5 px-2 py-0.5 rounded border border-[#064E3B]/10">Public Registry Verified</span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-body">
                    <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Breed</span>
                        <span className="font-bold text-[#064E3B]">{inv.breed}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Public Win Rate</span>
                        <span className="font-bold text-[#064E3B]">{inv.winRate}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Issued By Owner</span>
                        <span className="font-bold text-[#064E3B]">{inv.owner}</span>
                    </div>
                    <div>
                        <span className="text-slate-400 block text-[10px] font-semibold uppercase tracking-wider">Race Time</span>
                        <span className="font-bold text-[#064E3B] font-label text-[11px]">{inv.raceTime}</span>
                    </div>
                </div>
            </div>

            {/* Deep access / private metrics card (UC-JO-02) */}
            {isPending ? (
                <div className="bg-gradient-to-tr from-[#064E3B]/5 to-[#EAB308]/5 border border-[#064E3B]/20 rounded-2xl p-5 relative overflow-hidden shadow-sm">
                    <div className="absolute top-3 right-3 text-[#D97706] animate-pulse">
                        <Icons.Compass />
                    </div>

                    <div className="border-b border-[#064E3B]/10 pb-3 mb-4">
                        <h3 className="text-xs font-bold font-headline uppercase tracking-widest text-[#064E3B] flex items-center gap-2">
                            <span>🔓</span>
                            Private Health Metrics (Deep Access BR-SCHED-03)
                        </h3>
                        <p className="text-[10px] text-slate-500 font-semibold mt-1 leading-normal font-body">
                            Jockey Portal temporarily grants Deep Access to private veterinary, biological, and trainer track logs.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-body">
                        <div className="bg-white/90 p-3 rounded-xl border border-[#064E3B]/10 hover:border-[#064E3B]/20 transition shadow-sm">
                            <span className="text-slate-500 font-bold block text-[10px] mb-0.5">Last Veterinary Check</span>
                            <span className="font-bold text-[#064E3B]">{inv.medicalLogs.lastCheck} — {inv.medicalLogs.checkResult}</span>
                        </div>
                        <div className="bg-white/90 p-3 rounded-xl border border-[#064E3B]/10 hover:border-[#064E3B]/20 transition shadow-sm">
                            <span className="text-slate-500 font-bold block text-[10px] mb-0.5">Recent Training Weight</span>
                            <span className="font-bold text-[#064E3B]">{inv.medicalLogs.weight}</span>
                        </div>
                        <div className="bg-white/90 p-3 rounded-xl border border-[#064E3B]/10 hover:border-[#064E3B]/20 transition shadow-sm">
                            <span className="text-slate-500 font-bold block text-[10px] mb-0.5">Resting Heart Rate</span>
                            <span className="font-bold text-[#064E3B]">{inv.medicalLogs.restingHeartRate}</span>
                        </div>
                        <div className="bg-white/90 p-3 rounded-xl border border-[#064E3B]/10 hover:border-[#064E3B]/20 transition shadow-sm">
                            <span className="text-slate-500 font-bold block text-[10px] mb-0.5">Injury/Medical History</span>
                            <span className="font-bold text-[#064E3B]">{inv.medicalLogs.injuryHistory}</span>
                        </div>
                        
                        <div className="col-span-1 sm:col-span-2 bg-white/90 p-3.5 rounded-xl border border-[#064E3B]/10 shadow-sm">
                            <span className="text-slate-500 font-bold block text-[10px] mb-1">Trainer Track Notes</span>
                            <p className="text-slate-755 leading-relaxed text-xs italic">
                                "{inv.medicalLogs.trainerNotes}"
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 text-center space-y-3 shadow-sm">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-450 mx-auto">
                        <Icons.Lock />
                    </div>
                    <div>
                        <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center justify-center gap-1.5">
                            🔒 Private Records Locked
                        </h3>
                        <p className="text-xs text-slate-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                            Under security business rule <strong className="text-[#064E3B] font-label text-[10px]">BR-SCHED-03</strong>, "Deep Access" is strictly revoked for offers with a status of Expired, Declined, Cancelled, or Superseded to protect the Owner's proprietary track data.
                        </p>
                    </div>
                </div>
            )}

            {/* Actions for Pending invitation (UC-JO-03) */}
            {isPending && (
                <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 space-y-4 shadow-sm">
                    <div className="border-b border-slate-100 pb-2.5">
                        <h4 className="text-xs font-bold text-[#064E3B] uppercase tracking-wide">Submit Ride Decision</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">Accepting registers you tentatively. Declining releases the hold instantly.</p>
                    </div>
                    
                    <div className="flex gap-4 font-body">
                        <button
                            onClick={() => onAccept(inv.id)}
                            className="flex-1 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] px-4 py-3.5 text-xs font-bold shadow-sm transition active:scale-95 duration-200"
                        >
                            ✓ Accept Riding Invitation
                        </button>
                        <button
                            onClick={() => onDecline(inv.id)}
                            className="flex-1 rounded-xl border border-slate-200 bg-[#F4F6F5] text-slate-650 hover:bg-slate-100 px-4 py-3.5 text-xs font-bold transition active:scale-95 duration-200"
                        >
                            ✕ Decline Invitation
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}