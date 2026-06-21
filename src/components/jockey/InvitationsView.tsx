import React, { useState, useMemo } from "react";
import { cn } from "../../lib/utils";
import type {
  Invitation,
  InvStatus,
} from "../../services/invitationService.ts";
import {
  Clock,
  CheckCircle,
  XCircle,
  ShieldAlert,
  Search,
  Mail,
  Lock,
  Activity,
} from "lucide-react";

type FilterType = "All" | InvStatus;

interface InvitationsViewProps {
  data: Invitation[];
  selectedId: number | null;
  setSelectedId: (id: number | null) => void;
  onAccept: (id: number) => void;
  onDecline: (id: number) => void;
}

const Icons = {
  Clock: () => <Clock className="w-4 h-4 text-current" />,
  CheckCircle: () => <CheckCircle className="w-4 h-4 text-current" />,
  XCircle: () => <XCircle className="w-4 h-4 text-current" />,
  ShieldAlert: () => <ShieldAlert className="w-4 h-4 text-current" />,
  Mail: () => <Mail className="w-4 h-4 text-current" />,
  Lock: () => <Lock className="w-5 h-5 text-current" />,
  Activity: () => <Activity className="w-4 h-4 text-current" />,
};

const statusConfig: Record<
  InvStatus | "Confirmed",
  {
    color: string;
    bg: string;
    border: string;
    Icon: React.ElementType;
    label: string;
  }
> = {
  Pending: {
    color: "text-[#D97706]",
    bg: "bg-[#D97706]/10",
    border: "border-[#D97706]/20",
    Icon: Icons.Clock,
    label: "Pending",
  },
  Accepted: {
    color: "text-[#064E3B]",
    bg: "bg-[#064E3B]/10",
    border: "border-[#064E3B]/20",
    Icon: Icons.CheckCircle,
    label: "Accepted",
  },
  Confirmed: {
    color: "text-[#064E3B]",
    bg: "bg-[#064E3B]/10",
    border: "border-[#064E3B]/20",
    Icon: Icons.CheckCircle,
    label: "Confirmed",
  },
  Declined: {
    color: "text-rose-700",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    Icon: Icons.XCircle,
    label: "Declined",
  },
  Expired: {
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    Icon: Icons.Clock,
    label: "Expired",
  },
  Cancelled: {
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    Icon: Icons.XCircle,
    label: "Cancelled",
  },
  Superseded: {
    color: "text-slate-500",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    Icon: Icons.XCircle,
    label: "Superseded",
  },
};

export function InvitationsView({
  data,
  selectedId,
  setSelectedId,
  onAccept,
  onDecline,
}: InvitationsViewProps) {
  const [filter, setFilter] = useState<FilterType>("All");
  const [search, setSearch] = useState("");

  const filters: FilterType[] = [
    "All",
    "Pending",
    "Accepted",
    "Declined",
    "Expired",
  ];

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

  const selectedInv = data.find((i) => i.id === String(selectedId)) ?? null;
  const pendingInvites = data.filter((i) => i.status === "Pending");

  return (
    <div className="flex-1 flex h-full w-full overflow-hidden font-body">
      <div className="w-96 shrink-0 border-r border-[#064E3B]/10 bg-white flex flex-col h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 space-y-3.5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-bold font-headline text-[#064E3B] text-lg">
              Inbound Offers
            </h2>
            {pendingInvites.length > 0 && (
              <span className="rounded bg-[#EAB308]/20 text-[#D97706] font-bold px-2.5 py-0.5 text-[9px] uppercase border border-[#EAB308]/30">
                {pendingInvites.length} Pending
              </span>
            )}
          </div>

          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
              <Search className="w-4 h-4 text-current" />
            </span>
            <input
              type="text"
              placeholder="Search horse..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#F4F6F5]/50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-800 outline-none"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-xl px-3 py-2 text-xs font-bold whitespace-nowrap",
                  filter === f
                    ? "bg-[#064E3B] text-white"
                    : "bg-[#F4F6F5] text-slate-500"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm gap-2">
              <span className="h-10 w-10 opacity-30 text-[#064E3B]">
                <Mail className="w-10 h-10 text-current" />
              </span>
              <p className="font-bold">No invitations found</p>
            </div>
          ) : (
            filtered.map((inv) => {
              const cfg = statusConfig[inv.status];
              const StatusIcon = cfg.Icon;
              const isPending = inv.status === "Pending";
              return (
                <div
                  key={inv.id}
                  onClick={() => setSelectedId(Number(inv.id))}
                  className={cn(
                    "relative group flex items-start gap-3 rounded-2xl border p-4 cursor-pointer",
                    selectedId === Number(inv.id)
                      ? "border-[#064E3B] bg-[#064E3B]/5"
                      : "border-slate-200 bg-white"
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <p className="font-bold font-headline text-[#064E3B] truncate text-sm">
                        {inv.horse}
                      </p>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[8px] font-black uppercase shrink-0",
                          cfg.color,
                          cfg.bg,
                          cfg.border
                        )}
                      >
                        <StatusIcon /> {cfg.label}
                      </span>
                    </div>
                    <p className="text-xs text-slate-555 font-semibold truncate">
                      {inv.tournament}
                    </p>
                    {isPending && (
                      <div className="mt-1.5">
                        <span className="text-[8px] text-[#D97706] font-black bg-[#EAB308]/10 px-2 py-0.5 rounded border border-[#EAB308]/20 uppercase">
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
      </div>

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

// ─── Component: InvitationDetail ───────────────────────────────────────────────

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
        <span className="h-16 w-16 opacity-30 text-[#064E3B]">
          <Mail className="w-16 h-16 text-current" />
        </span>
        <h3 className="font-bold">No Offer Selected</h3>
      </div>
    );
  }

  const cfg = statusConfig[inv.status];
  const StatusIcon = cfg.Icon;
  const isPending = inv.status === "Pending";

  return (
    <div className="p-6 h-full overflow-y-auto space-y-6 font-body">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#064E3B]/10 pb-5">
        <div>
          <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
            {inv.horse}
          </h2>
          <p className="text-xs font-semibold text-slate-500">
            {inv.tournament}
          </p>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[10px] font-black uppercase",
            cfg.color,
            cfg.bg,
            cfg.border
          )}
        >
          <StatusIcon /> {cfg.label}
        </span>
      </div>

      <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">
              Owner
            </p>
            <p className="text-sm font-semibold text-slate-800">{inv.owner}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 font-bold uppercase">
              Race Time
            </p>
            <p className="text-sm font-semibold text-slate-800">
              {inv.raceTime}
            </p>
          </div>
        </div>
      </div>

      {isPending ? (
        <div className="bg-gradient-to-tr from-[#064E3B]/5 to-[#EAB308]/5 border border-[#064E3B]/20 rounded-2xl p-5 shadow-sm">
          <h3 className="text-xs font-bold font-headline uppercase text-[#064E3B]">
            🔓 Private Health Metrics (Deep Access)
          </h3>
          <p className="text-xs text-slate-555 italic mt-3">
            "
            {(inv as unknown as { medicalLogs?: { trainerNotes?: string } }).medicalLogs?.trainerNotes ||
              "Horse is looking strong in the final furlong. Responds well."}
            "
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 text-center shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 border border-slate-100 text-slate-455 mx-auto">
            <Lock className="w-5 h-5 text-current" />
          </div>
          <h3 className="font-bold text-md text-[#064E3B] mt-2">
            🔒 Private Records Locked
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mt-1">
            Deep Access is revoked for completed or non-pending offers.
          </p>
        </div>
      )}

      {isPending && (
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 space-y-4 shadow-sm">
          <div className="flex gap-4">
            <button
              onClick={() => onAccept(Number(inv.id))}
              className="flex-1 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] py-3.5 text-xs font-bold transition"
            >
              Accept Invitation
            </button>
            <button
              onClick={() => onDecline(Number(inv.id))}
              className="flex-1 border border-slate-200 bg-[#F4F6F5] text-slate-655 hover:bg-slate-100 py-3.5 text-xs font-bold transition"
            >
              Decline
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
