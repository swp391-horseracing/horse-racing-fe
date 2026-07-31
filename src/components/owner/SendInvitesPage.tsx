import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { useOwner, type Entry, type Jockey } from "../../hooks/useOwner";
import type { Invitation } from "../../types/invitation";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../ui/toast";

interface SendInvitesPageProps {
  entries?: Entry[];
  jockeys?: Jockey[];
  invitations?: Invitation[];
  loadJockeys?: () => Promise<void>;
  loadInvitations?: (
    raceId: string,
    status?: "pending" | "approved" | "rejected"
  ) => Promise<void>;
  inviteJockey?: (
    title: string,
    entryId: string,
    jockeyId: string,
    horseId: string,
    message?: string
  ) => Promise<any>;
}

export function SendInvitesPage({
  entries: propEntries,
  jockeys: propJockeys,
  invitations: propInvitations,
  loadJockeys: propLoadJockeys,
  loadInvitations: propLoadInvitations,
  inviteJockey: propInviteJockey,
}: SendInvitesPageProps = {}) {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string })?.returnTo;

  const {
    entries: hookEntries,
    jockeys: hookJockeys,
    invitations: hookInvitations,
    loadJockeys: hookLoadJockeys,
    loadInvitations: hookLoadInvitations,
    inviteJockey: hookInviteJockey,
  } = useOwner();

  const entries = propEntries ?? hookEntries;
  const jockeys = propJockeys ?? hookJockeys;
  const invitations = propInvitations ?? hookInvitations;
  const loadJockeys = propLoadJockeys ?? hookLoadJockeys;
  const loadInvitations = propLoadInvitations ?? hookLoadInvitations;
  const inviteJockey = propInviteJockey ?? hookInviteJockey;

  const { toasts, addToast } = useToast(3000);

  useEffect(() => {
    if (loadJockeys) {
      void loadJockeys();
    }
  }, [loadJockeys]);

  const entry = entries.find((e: Entry) => e.entryId === entryId);

  useEffect(() => {
    if (entry?.raceId && loadInvitations) {
      void loadInvitations(entry.raceId);
    }
  }, [entry?.raceId, loadInvitations]);

  const [selectedJockeyId, setSelectedJockeyId] = useState<
    string | number | null
  >(null);
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviting, setInviting] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [step, setStep] = useState<"select" | "write">("select");
  const [titleError, setTitleError] = useState("");

  type JockeyTab = "available" | "all" | "racing" | "invited";
  type JockeyStatus = "available" | "racing" | "invited";

  const [activeTab, setActiveTab] = useState<JockeyTab>("available");
  const [listPage, setListPage] = useState(1);
  const PAGE_SIZE = 10;

  const horseId = entry?.horseId;

  const pendingJockeyIds = useMemo(() => {
    const ids = new Set<string>();
    if (!horseId) return ids;
    invitations.forEach((inv) => {
      if (
        inv.status === "pending" &&
        String(inv.horse.id) === String(horseId)
      ) {
        ids.add(String(inv.jockey.id));
      }
    });
    return ids;
  }, [invitations, horseId]);

  const baseList = useMemo(() => {
    return jockeys.map((j) => {
      const id = String(j.id);
      const status: JockeyStatus = pendingJockeyIds.has(id)
        ? "invited"
        : j.isRacing
          ? "racing"
          : "available";
      return { jockey: j, status };
    });
  }, [jockeys, pendingJockeyIds]);

  const counts = useMemo(() => {
    const c = { available: 0, racing: 0, invited: 0 };
    baseList.forEach(({ status }) => {
      c[status]++;
    });
    return c;
  }, [baseList]);

  const visibleList = useMemo(() => {
    const allowed: Record<JockeyTab, JockeyStatus[]> = {
      available: ["available"],
      all: ["available", "racing", "invited"],
      racing: ["racing"],
      invited: ["invited"],
    };
    const term = keyword.trim().toLowerCase();
    return baseList.filter(({ jockey, status }) => {
      if (!allowed[activeTab].includes(status)) return false;
      if (!term) return true;
      return (
        jockey.fullName.toLowerCase().includes(term) ||
        (jockey.club && jockey.club.toLowerCase().includes(term))
      );
    });
  }, [baseList, activeTab, keyword]);

  const totalPages = Math.max(1, Math.ceil(visibleList.length / PAGE_SIZE));
  const safePage = Math.min(listPage, totalPages);
  const pagedList = visibleList.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  );

  const selectedJockey = jockeys.find((j) => j.id === selectedJockeyId);

  const handleSelectJockey = (jockeyId: string | number) => {
    setSelectedJockeyId(jockeyId);
    setStep("write");
  };

  const handleSend = async () => {
    if (!entry || !selectedJockey) return;

    if (inviteTitle.trim().length < 5) {
      setTitleError("Title must be at least 5 characters");
      addToast("Title must be at least 5 characters", "error");
      return;
    }
    setTitleError("");

    setInviting(true);
    try {
      await inviteJockey(
        inviteTitle,
        entry.entryId,
        String(selectedJockey.id),
        entry.horseId,
        inviteMessage
      );
      addToast("Invitation sent successfully.", "success");
      navigate(
        returnTo ||
          "/owner/jockeys?selected=" + entry.entryId + "&tab=invitation"
      );
    } catch (error: any) {
      const errors = error?.response?.data?.errors;
      if (Array.isArray(errors) && errors.length > 0) {
        errors.forEach((e: { message: string }) =>
          addToast(e.message, "error")
        );
      } else {
        addToast(
          error?.response?.data?.message ||
            "Failed to send invitation. Please try again.",
          "error"
        );
      }
    } finally {
      setInviting(false);
    }
  };

  const handleCancel = () => {
    if (returnTo) {
      navigate(returnTo);
    } else if (entry) {
      navigate("/owner/jockeys?selected=" + entry.entryId);
    } else {
      navigate("/owner/jockeys");
    }
  };

  if (!entry) {
    return (
      <div className="max-w-6xl mx-auto p-5 h-full flex flex-col items-center justify-center">
        <p className="text-slate-400 text-lg font-semibold">Entry not found</p>
        <button
          onClick={handleCancel}
          className="mt-4 rounded-2xl bg-[#064E3B] px-6 py-3 text-sm font-bold text-white hover:bg-[#043E2F]"
        >
          Back to Jockey Roster
        </button>
      </div>
    );
  }

  const toPascalCase = (str: string): string => {
    if (!str) return "";
    return str
      .split(/[_\s-]+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div
      key={entry.entryId}
      className="max-w-6xl mx-auto p-5 h-full flex flex-col"
    >
      <ToastContainer toasts={toasts} />

      {step === "select" ? (
        <>
          <div className="flex items-center justify-between mb-8 border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-primary!">
                {toPascalCase("choose jockey")}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Select a jockey for {entry.horseName} in {entry.raceName}.
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition"
            >
              Cancel
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 mb-6">
            <div className="font-semibold text-slate-800 text-lg">
              {entry.horseName}
            </div>
            <div className="text-sm text-slate-500 mt-1">{entry.raceName}</div>
            <div className="text-xs text-slate-400 mt-2">
              {new Date(entry.scheduleAt).toLocaleString("en-GB")} •{" "}
              {entry.venue}
            </div>
          </div>

          <div className="mb-4 flex flex-wrap items-center gap-2">
            {(
              [
                {
                  key: "available",
                  label: "Available",
                  activeClass: "bg-emerald-600 text-white border-emerald-600",
                  count: counts.available,
                },
                {
                  key: "racing",
                  label: "Currently Racing",
                  activeClass: "bg-amber-500 text-white border-amber-500",
                  count: counts.racing,
                },
                {
                  key: "invited",
                  label: "Already Invited",
                  activeClass: "bg-slate-600 text-white border-slate-600",
                  count: counts.invited,
                },
                {
                  key: "all",
                  label: "All",
                  activeClass: "bg-[#064E3B] text-white border-[#064E3B]",
                  count: baseList.length,
                },
              ] as {
                key: JockeyTab;
                label: string;
                activeClass: string;
                count: number;
              }[]
            ).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => {
                  setActiveTab(tab.key);
                  setListPage(1);
                }}
                className={cn(
                  "rounded-xl border px-3.5 py-1.5 text-xs font-bold transition",
                  activeTab === tab.key
                    ? tab.activeClass
                    : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                )}
              >
                {tab.label} <span className="opacity-80">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-3.5 text-slate-400"
                size={18}
              />
              <input
                value={keyword}
                onChange={(e) => {
                  setKeyword(e.target.value);
                  setListPage(1);
                }}
                placeholder="Search jockey by name or club..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-700 outline-none transition focus:border-[#064E3B]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6">
            {pagedList.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center text-sm text-slate-400">
                {keyword.trim()
                  ? "No jockeys match your search."
                  : activeTab === "available"
                    ? "No available jockeys right now."
                    : activeTab === "racing"
                      ? "No jockeys are currently racing."
                      : activeTab === "invited"
                        ? "No invited jockeys yet."
                        : "No jockeys found."}
              </div>
            ) : (
              pagedList.map(({ jockey, status }) => {
                const isSelected = selectedJockeyId === jockey.id;
                const selectable = status === "available";
                return (
                  <button
                    key={jockey.id}
                    type="button"
                    disabled={!selectable}
                    onClick={() => selectable && handleSelectJockey(jockey.id)}
                    className={cn(
                      "w-full rounded-3xl border p-5 text-left transition flex items-center gap-4",
                      isSelected
                        ? "border-[#064E3B] bg-emerald-50 shadow-sm"
                        : selectable
                          ? "border-slate-200 bg-white hover:border-[#064E3B] hover:bg-slate-50"
                          : "border-slate-200 bg-slate-50 opacity-60 cursor-not-allowed"
                    )}
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600 shrink-0">
                      {jockey.avatarUrl ? (
                        <img
                          src={jockey.avatarUrl}
                          alt={jockey.fullName}
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        jockey.fullName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-slate-800 truncate">
                          {jockey.fullName}
                        </span>
                        {status === "available" && (
                          <span className="rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                            Available
                          </span>
                        )}
                        {status === "racing" && (
                          <span className="rounded-full bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                            Currently Racing
                          </span>
                        )}
                        {status === "invited" && (
                          <span className="rounded-full bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide">
                            Invited
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-500 truncate mt-0.5">
                        {jockey.club || "No club"}
                        {jockey.experienceYear !== null &&
                        jockey.experienceYear !== undefined
                          ? ` • ${jockey.experienceYear} yrs experience`
                          : ""}
                        {jockey.weightKg !== null &&
                        jockey.weightKg !== undefined
                          ? ` • ${jockey.weightKg}kg`
                          : ""}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition",
                        isSelected
                          ? "border-[#064E3B] bg-[#064E3B]"
                          : "border-slate-300 bg-white"
                      )}
                    >
                      {isSelected && (
                        <span className="block h-2 w-2 rounded-full bg-white" />
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 border-t pt-4 mb-6">
              <button
                onClick={() => setListPage((p) => Math.max(1, p - 1))}
                disabled={safePage <= 1}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Prev
              </button>
              <span className="text-xs text-slate-500">
                {safePage} / {totalPages}
              </span>
              <button
                onClick={() => setListPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage >= totalPages}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t pt-6">
            <button
              onClick={handleCancel}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-500">
                {selectedJockeyId ? "1 jockey selected" : "No jockey selected"}
              </span>
              <button
                onClick={() => selectedJockeyId && setStep("write")}
                disabled={!selectedJockeyId}
                className="rounded-2xl bg-[#064E3B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#043E2F] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-8 border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-primary!">
                {toPascalCase("write invitation")}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Send a custom note to {selectedJockey?.fullName} before
                inviting.
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="text-sm font-semibold text-slate-500 hover:text-slate-700 transition"
            >
              Cancel
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 mb-6">
            <div className="font-semibold text-slate-800 text-lg">
              {entry.horseName}
            </div>
            <div className="text-sm text-slate-500 mt-1">{entry.raceName}</div>
            <div className="text-xs text-slate-400 mt-2">
              {new Date(entry.scheduleAt).toLocaleString("en-GB")} •{" "}
              {entry.venue}
            </div>
            <div className="mt-3 flex items-center gap-2 text-sm">
              <span className="text-slate-400">Jockey:</span>
              <span className="font-semibold text-[#064E3B]">
                {selectedJockey?.fullName}
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-5 max-w-2xl">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Title
              </label>
              <input
                value={inviteTitle}
                onChange={(e) => {
                  setInviteTitle(e.target.value);
                  if (titleError) setTitleError("");
                }}
                placeholder={`Invitation for ${entry.raceName}`}
                className={cn(
                  "w-full rounded-2xl border bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition",
                  titleError
                    ? "border-rose-300 focus:border-rose-500"
                    : "border-slate-200 focus:border-[#064E3B]"
                )}
              />
              {titleError && (
                <p className="mt-1 text-xs text-rose-500 font-medium">
                  {titleError}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Message
              </label>
              <textarea
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={5}
                placeholder="Write a short message to the jockey..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#064E3B] resize-y"
              />
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end border-t pt-6 mt-6">
            <button
              onClick={() => setStep("select")}
              className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Back
            </button>
            <button
              onClick={handleSend}
              disabled={inviting}
              className="rounded-2xl bg-[#064E3B] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#043E2F] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {inviting ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
