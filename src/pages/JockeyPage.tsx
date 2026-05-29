import { useState } from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "../components/ui/sidebar";
import { TooltipProvider } from "../components/ui/tooltip";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";

// ─── Inline SVG Icons ────────────────────────────────────────────────────────

const Icons = {
    Dashboard: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
        </svg>
    ),
    Calendar: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
    ),
    Mail: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22,6 12,13 2,6"/>
        </svg>
    ),
    Horse: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 16v4h3l1-4"/><path d="M10 16v4h3l1-4"/>
            <path d="M2 12c0-2 1-3 3-4l2-1c1-3 3-5 7-5 2 0 4 1 5 3l1 2h1c1 0 1 1 1 2v2c0 1-1 2-2 2h-1l-1 2H7l-1-2H5c-2 0-3-1-3-3z"/>
        </svg>
    ),
    ChevronRight: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6"/>
        </svg>
    ),
    Clock: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
    ),
    CheckCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
        </svg>
    ),
    XCircle: () => (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
    ),
};

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
    label: string;
    icon: React.ElementType;
    key: string;
    badge?: number;
};

type InvStatus = "Pending" | "Accepted" | "Declined" | "Expired" | "Cancelled" | "Superseded";

type Invitation = {
    id: number;
    horse: string;
    tournament: string;
    raceTime: string;
    status: InvStatus;
    breed: string;
    winRate: string;
};

// ─── Simplified Jockey Nav Config ────────────────────────────────────────────

const jockeyNav: NavItem[] = [
    { label: "Dashboard",   icon: Icons.Dashboard, key: ROUTES.JOCKEY_DASHBOARD },
    { label: "Schedule",    icon: Icons.Calendar,  key: ROUTES.JOCKEY_SCHEDULE },
    { label: "Invitations", icon: Icons.Mail,      key: ROUTES.JOCKEY_INVITATIONS, badge: 3 },
];

// ─── Invitation data ──────────────────────────────────────────────────────────

const initialInvitations: Invitation[] = [
    { id: 1, horse: "Thunder Blaze", tournament: "Royal Cup 2025",    raceTime: "2025-06-14 14:00", status: "Pending",  breed: "Thoroughbred",  winRate: "72%" },
    { id: 2, horse: "Silver Wind",   tournament: "Grand Prix Spring", raceTime: "2025-06-20 10:00", status: "Accepted", breed: "Arabian",       winRate: "68%" },
    { id: 3, horse: "Dark Matter",   tournament: "National Derby",    raceTime: "2025-07-01 09:30", status: "Pending",  breed: "Quarter Horse", winRate: "55%" },
    { id: 4, horse: "Golden Flash",  tournament: "Summer Classic",    raceTime: "2025-05-10 15:00", status: "Expired",  breed: "Appaloosa",     winRate: "61%" },
    { id: 5, horse: "Storm Rider",   tournament: "Champion League",   raceTime: "2025-06-28 11:00", status: "Declined", breed: "Standardbred",  winRate: "48%" },
];

// ─── Status config ────────────────────────────────────────────────────────────

const statusConfig: Record<InvStatus, { color: string; Icon: React.ElementType; label: string }> = {
    Pending:    { color: "bg-amber-100 text-amber-700 border-amber-200",       Icon: Icons.Clock,       label: "Pending"    },
    Accepted:   { color: "bg-emerald-100 text-emerald-700 border-emerald-200", Icon: Icons.CheckCircle, label: "Accepted"   },
    Declined:   { color: "bg-red-100 text-red-600 border-red-200",             Icon: Icons.XCircle,     label: "Declined"   },
    Expired:    { color: "bg-gray-100 text-gray-500 border-gray-200",          Icon: Icons.Clock,       label: "Expired"    },
    Cancelled:  { color: "bg-gray-100 text-gray-500 border-gray-200",          Icon: Icons.XCircle,     label: "Cancelled"  },
    Superseded: { color: "bg-gray-100 text-gray-500 border-gray-200",          Icon: Icons.XCircle,     label: "Superseded" },
};

// ─── Invitation Card ──────────────────────────────────────────────────────────

function InvitationCard({
    inv,
    selected,
    onSelect,
}: {
    inv: Invitation;
    selected: boolean;
    onSelect: () => void;
}) {
    const cfg = statusConfig[inv.status];
    const StatusIcon = cfg.Icon;

    return (
        <div
            onClick={onSelect}
            className={cn(
                "cursor-pointer rounded-xl border p-4 transition-all duration-200",
                selected
                    ? "border-gray-800 bg-gray-50 shadow-md"
                    : "border-gray-200 bg-white hover:border-gray-400 hover:shadow-sm"
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{inv.horse}</p>
                    <p className="text-sm text-gray-500 truncate">{inv.tournament}</p>
                </div>
                <span className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium shrink-0",
                    cfg.color
                )}>
                    <span className="h-3 w-3 inline-flex"><StatusIcon /></span>
                    {cfg.label}
                </span>
            </div>
            <p className="mt-2 text-xs text-gray-400">
                🕐 {new Date(inv.raceTime).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
            </p>
        </div>
    );
}

// ─── Invitation Detail ────────────────────────────────────────────────────────

function InvitationDetail({
    inv,
    onAction,
}: {
    inv: Invitation | null;
    onAction: (id: number, action: "accept" | "decline") => void;
}) {
    if (!inv) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 gap-3">
                <span className="h-12 w-12 opacity-30 inline-flex"><Icons.Mail /></span>
                <p className="text-sm">Select an invitation to view details</p>
            </div>
        );
    }

    const cfg = statusConfig[inv.status];
    const StatusIcon = cfg.Icon;
    const isPending = inv.status === "Pending";

    return (
        <div className="p-6 h-full overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{inv.horse}</h2>
                    <p className="text-gray-500">{inv.tournament}</p>
                </div>
                <span className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium",
                    cfg.color
                )}>
                    <span className="h-4 w-4 inline-flex"><StatusIcon /></span>
                    {cfg.label}
                </span>
            </div>

            {/* Race Info */}
            <div className="rounded-xl border border-gray-200 p-4 mb-4 bg-gray-50">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Race Info</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                        <p className="text-gray-400 text-xs">Race Time</p>
                        <p className="font-medium text-gray-800">
                            {new Date(inv.raceTime).toLocaleString("en-GB", { dateStyle: "long", timeStyle: "short" })}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Breed</p>
                        <p className="font-medium text-gray-800">{inv.breed}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">Win Rate</p>
                        <p className="font-medium text-gray-800">{inv.winRate}</p>
                    </div>
                </div>
            </div>

            {/* Deep Access */}
            {isPending ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mb-6">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-3">
                        🔓 Private Horse Records (Deep Access)
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <p className="text-amber-500 text-xs">Last Medical Check</p>
                            <p className="font-medium text-gray-800">2025-05-28 — Clear</p>
                        </div>
                        <div>
                            <p className="text-amber-500 text-xs">Training Weight</p>
                            <p className="font-medium text-gray-800">490 kg</p>
                        </div>
                        <div>
                            <p className="text-amber-500 text-xs">Heart Rate (resting)</p>
                            <p className="font-medium text-gray-800">36 bpm</p>
                        </div>
                        <div>
                            <p className="text-amber-500 text-xs">Injury History</p>
                            <p className="font-medium text-gray-800">None recorded</p>
                        </div>
                        <div className="col-span-2">
                            <p className="text-amber-500 text-xs">Trainer Notes</p>
                            <p className="font-medium text-gray-800 text-xs">
                                Responds well to firm leads; prefers outside track position.
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 mb-6">
                    <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                        🔒 Private Records Locked
                    </h3>
                    <p className="text-sm text-gray-500">Deep access is only available for Pending invitations.</p>
                    <div className="mt-2 text-sm grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-gray-400 text-xs">Breed</p>
                            <p className="font-medium text-gray-700">{inv.breed}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-xs">Win Rate</p>
                            <p className="font-medium text-gray-700">{inv.winRate}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Actions */}
            {isPending && (
                <div className="flex gap-3">
                    <button
                        onClick={() => onAction(inv.id, "accept")}
                        className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-700 active:scale-95"
                    >
                        ✓ Accept Invitation
                    </button>
                    <button
                        onClick={() => onAction(inv.id, "decline")}
                        className="flex-1 rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 active:scale-95"
                    >
                        ✕ Decline
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── Placeholder views ────────────────────────────────────────────────────────

function PlaceholderView({ label, icon: Icon }: { label: string; icon: React.ElementType }) {
    return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-4">
            <span className="h-14 w-14 opacity-20 inline-flex"><Icon /></span>
            <p className="text-lg font-medium text-gray-300">{label}</p>
            <p className="text-sm text-gray-400">This section is coming soon.</p>
        </div>
    );
}

// ─── Invitations View ─────────────────────────────────────────────────────────

type FilterType = "All" | InvStatus;

function InvitationsView() {
    const [selected, setSelected] = useState<number | null>(null);
    const [filter, setFilter] = useState<FilterType>("All");
    const [data, setData] = useState<Invitation[]>(initialInvitations);

    const filters: FilterType[] = ["All", "Pending", "Accepted", "Declined", "Expired"];
    const filtered = filter === "All" ? data : data.filter((i) => i.status === filter);
    const selectedInv = data.find((i) => i.id === selected) ?? null;
    const pendingCount = data.filter((i) => i.status === "Pending").length;

    const handleAction = (id: number, action: "accept" | "decline") => {
        setData((prev) =>
            prev.map((i) =>
                i.id === id
                    ? { ...i, status: action === "accept" ? ("Accepted" as InvStatus) : ("Declined" as InvStatus) }
                    : i
            )
        );
    };

    return (
        <div className="flex h-full w-full">
            {/* Left: list */}
            <div className="w-80 shrink-0 border-r border-gray-200 flex flex-col h-full bg-white">
                <div className="px-4 pt-5 pb-3">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-lg font-bold text-gray-900">Invitations</h1>
                        {pendingCount > 0 && (
                            <span className="rounded-full bg-amber-100 text-amber-700 text-xs font-semibold px-2 py-0.5">
                                {pendingCount} pending
                            </span>
                        )}
                    </div>
                    <div className="flex gap-1.5 flex-wrap">
                        {filters.map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={cn(
                                    "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                                    filter === f
                                        ? "bg-gray-900 text-white"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                )}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-2">
                    {filtered.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 text-sm gap-2">
                            <span className="h-8 w-8 opacity-30 inline-flex"><Icons.Mail /></span>
                            <p>You have no riding invitations at this time.</p>
                        </div>
                    ) : (
                        filtered.map((inv) => (
                            <InvitationCard
                                key={inv.id}
                                inv={inv}
                                selected={selected === inv.id}
                                onSelect={() => setSelected(inv.id)}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Right: detail */}
            <div className="flex-1 overflow-hidden h-full bg-white">
                <InvitationDetail inv={selectedInv} onAction={handleAction} />
            </div>
        </div>
    );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function JockeySidebar({ active, setActive }: { active: string; setActive: (k: string) => void }) {
    return (
        <Sidebar 
            variant="sidebar" 
            collapsible="none" 
            className="!static h-full border-r shrink-0 bg-white"
        >
            <SidebarHeader className="px-3 py-4">
                <div className="flex items-center gap-2 px-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900 text-white shrink-0">
                        <span className="h-4 w-4 inline-flex"><Icons.Horse /></span>
                    </div>
                    <div className="overflow-hidden">
                        <p className="truncate text-sm font-semibold text-gray-900">Jockey Portal</p>
                        <p className="truncate text-xs text-gray-400">James Nguyen</p>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Menu</SidebarGroupLabel>
                    <SidebarMenu>
                        {jockeyNav.map((item) => (
                            <SidebarMenuItem key={item.key}>
                                <SidebarMenuButton
                                    isActive={active === item.key}
                                    onClick={() => setActive(item.key)}
                                    tooltip={item.label}
                                >
                                    <item.icon />
                                    <span>{item.label}</span>
                                </SidebarMenuButton>
                                {item.badge !== undefined && (
                                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                                )}
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function JockeyPage() {
    const [active, setActive] = useState<string>(ROUTES.JOCKEY_INVITATIONS);

    const renderContent = () => {
        switch (active) {
            case ROUTES.JOCKEY_DASHBOARD:   return <PlaceholderView label="Dashboard Overview" icon={Icons.Dashboard} />;
            case ROUTES.JOCKEY_SCHEDULE:    return <PlaceholderView label="My Riding Schedule" icon={Icons.Calendar}  />;
            case ROUTES.JOCKEY_INVITATIONS: return <InvitationsView />;
            default:                        return null;
        }
    };

    const activeLabel = jockeyNav.find((n) => n.key === active)?.label ?? "";

    return (
        <TooltipProvider>
            <SidebarProvider>
                <div className="flex h-full w-full overflow-hidden relative bg-white">
                    <JockeySidebar active={active} setActive={setActive} />

                    <main className="flex flex-1 flex-col overflow-hidden h-full">
                        {/* Context-driven Top bar */}
                        <div className="flex h-12 shrink-0 items-center gap-3 border-b border-gray-200 px-4 bg-white">
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <span>Jockey</span>
                                <span className="h-3 w-3 inline-flex"><Icons.ChevronRight /></span>
                                <span className="font-medium text-gray-800">{activeLabel}</span>
                            </div>
                        </div>

                        {/* Layout Inner Content */}
                        <div className="flex-1 overflow-hidden min-h-0">
                            {renderContent()}
                        </div>
                    </main>
                </div>
            </SidebarProvider>
        </TooltipProvider>
    );
}