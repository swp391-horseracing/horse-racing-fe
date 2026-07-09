import { useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { cn } from "../../lib/utils";
import { useOwner, type Entry } from "../../hooks/useOwner.ts";
import { useToast } from "../../hooks/useToast";
import { ToastContainer } from "../ui/toast";

export function SendInvitesPage() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = (location.state as { returnTo?: string })?.returnTo;
  const { entries, jockeys, loadJockeys, inviteJockey } = useOwner();
  const { toasts, addToast } = useToast(3000);

  const entry = entries.find((e: Entry) => e.entryId === entryId);

  const [selectedJockeyId, setSelectedJockeyId] = useState<number | null>(null);
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");
  const [inviting, setInviting] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [step, setStep] = useState<"select" | "write">("select");

  const filteredJockeys = (() => {
    if (!keyword.trim()) return jockeys;
    const term = keyword.toLowerCase();
    return jockeys.filter(
      (j) =>
        j.fullName.toLowerCase().includes(term) ||
        (j.club && j.club.toLowerCase().includes(term))
    );
  })();

  const selectedJockey = jockeys.find((j) => j.id === selectedJockeyId);

  const handleSelectJockey = (jockeyId: number) => {
    setSelectedJockeyId(jockeyId);
    setStep("write");
  };

  const handleSend = async () => {
    if (!entry || !selectedJockey) return;

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
    } catch {
      addToast("Failed to send invitation. Please try again.", "error");
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
    <div className="max-w-6xl mx-auto p-5 h-full flex flex-col">
      <ToastContainer toasts={toasts} />

      {step === "select" ? (
        <>
          <div className="flex items-center justify-between mb-8 border-b pb-6">
            <div>
              <h2 className="text-3xl font-bold tracking-tight !text-primary">
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
              {new Date(entry.scheduleAt).toLocaleString()} • {entry.venue}
            </div>
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
                  if (!jockeys.length) loadJockeys();
                }}
                placeholder="Search jockey by name or club..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-11 py-3 text-sm text-slate-700 outline-none transition focus:border-[#064E3B]"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 space-y-3 mb-6">
            {filteredJockeys.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center text-sm text-slate-400">
                No jockeys found.
              </div>
            ) : (
              filteredJockeys.map((jockey) => {
                const isSelected = selectedJockeyId === jockey.id;
                return (
                  <button
                    key={jockey.id}
                    type="button"
                    onClick={() => handleSelectJockey(jockey.id)}
                    className={cn(
                      "w-full rounded-3xl border p-5 text-left transition",
                      isSelected
                        ? "border-[#064E3B] bg-emerald-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-[#064E3B] hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                        {jockey.fullName
                          .split(" ")
                          .map((part) => part[0])
                          .join("")}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-slate-800 truncate">
                          {jockey.fullName}
                        </div>
                        <div className="text-sm text-slate-500 truncate">
                          {jockey.club || "No club"}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>

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
              <h2 className="text-3xl font-bold tracking-tight !text-primary">
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
              {new Date(entry.scheduleAt).toLocaleString()} • {entry.venue}
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
                onChange={(e) => setInviteTitle(e.target.value)}
                placeholder={`Invitation for ${entry.raceName}`}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#064E3B]"
              />
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
