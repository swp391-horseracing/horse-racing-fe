import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { cn } from "../../../lib/utils";
import { type Entry, useOwner } from "../../../hooks/useOwner";

export default function SendInvites() {
  const { entryId } = useParams<{ entryId: string }>();
  const navigate = useNavigate();

  const { entries, jockeys, loadJockeys, inviteJockey, loadInvitations } =
    useOwner();

  const entry: Entry | undefined = useMemo(
    () => entries.find((e) => e.entryId === entryId),
    [entries, entryId]
  );

  const [keyword, setKeyword] = useState("");
  const [selectedJockeyId, setSelectedJockeyId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [inviteTitle, setInviteTitle] = useState("");
  const [inviteMessage, setInviteMessage] = useState("");

  useEffect(() => {
    loadJockeys();
  }, [loadJockeys]);

  useEffect(() => {
    if (entry?.raceId) {
      loadInvitations(entry.raceId);
    }
  }, [entry, loadInvitations]);

  const filteredJockeys = useMemo(() => {
    if (!keyword.trim()) return jockeys;
    const term = keyword.toLowerCase();
    return jockeys.filter(
      (j) =>
        j.fullName.toLowerCase().includes(term) ||
        (j.club && j.club.toLowerCase().includes(term))
    );
  }, [jockeys, keyword]);

  const selectedJockey = filteredJockeys.find((j) => j.id === selectedJockeyId);

  const handleSendClick = () => {
    if (!selectedJockey) return;
    setShowModal(true);
  };

  const handleConfirmSend = async () => {
    if (!entry || !selectedJockey) return;

    setSending(true);
    setShowModal(false);

    try {
      await inviteJockey(
        inviteTitle,
        entry.entryId,
        String(selectedJockey.id),
        entry.horseId,
        inviteMessage
      );

      alert("Invitation sent successfully!");
      navigate(-1);
    } catch (err) {
      console.error(err);
      alert("Failed to send invitation.");
    } finally {
      setSending(false);
    }
  };

  if (!entry) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <p className="text-xl text-slate-600">Entry not found</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-2 bg-[#064E3B] text-white rounded-xl hover:bg-[#043E2F]"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl border-slate-200 bg-slate-50 p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#064E3B]">
            Send Jockey Invite
          </h2>
          <p className="text-sm text-slate-500">For {entry.horseName}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={18} /> Back
        </button>
      </div>

      <div className="flex gap-6">
        {/* Left - Entry Info */}
        <div className="w-96 border border-slate-200 bg-white rounded-3xl p-6 h-fit">
          <div className="font-bold text-lg text-[#064E3B] mb-4">
            {entry.horseName}
          </div>
          <div className="text-slate-600">{entry.raceName}</div>
          <div className="text-xs text-slate-500 mt-1">
            {new Date(entry.scheduleAt).toLocaleString()} • {entry.venue}
          </div>

          <div className="mt-6 space-y-4 text-sm">
            <div>
              <span className="text-slate-500">Distance: </span>
              <span className="font-medium">{entry.distanceMeters}m</span>
            </div>
            <div>
              <span className="text-slate-500">Lane: </span>
              <span className="font-medium">#{entry.laneNumber}</span>
            </div>
            <div>
              <span className="text-slate-500">Weight: </span>
              <span className="font-medium">{entry.weightKg}kg</span>
            </div>
          </div>
        </div>

        {/* Right - Jockey Selection */}
        <div className="flex-1 border border-slate-200 bg-white rounded-3xl p-6">
          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-3.5 text-slate-400"
                size={18}
              />
              <input
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Search jockey by name or club..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-11 py-3 focus:border-[#064E3B] outline-none"
              />
            </div>
          </div>

          <div className="max-h-[580px] overflow-auto pr-2 space-y-2">
            {filteredJockeys.length === 0 ? (
              <p className="text-center py-12 text-slate-400">
                No jockeys found
              </p>
            ) : (
              filteredJockeys.map((jockey) => {
                const isSelected = selectedJockeyId === jockey.id;
                return (
                  <div
                    key={jockey.id}
                    onClick={() => setSelectedJockeyId(jockey.id)}
                    className={cn(
                      "flex items-center gap-4 rounded-2xl border p-5 cursor-pointer transition-all hover:border-[#064E3B]",
                      isSelected && "border-[#064E3B] bg-emerald-50"
                    )}
                  >
                    <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600">
                      {jockey.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-800">
                        {jockey.fullName}
                      </div>
                      <div className="text-sm text-slate-500">
                        {jockey.club}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "px-5 py-1.5 rounded-full text-xs font-bold",
                        isSelected
                          ? "bg-[#064E3B] text-white"
                          : "bg-slate-100 text-slate-600"
                      )}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-8 py-3 border rounded-2xl font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSendClick}
              disabled={!selectedJockey || sending}
              className="px-10 py-3 bg-[#064E3B] text-white rounded-2xl font-bold hover:bg-[#043E2F] disabled:opacity-50"
            >
              Send Invitation
            </button>
          </div>
        </div>
      </div>

      {/* Modal */}
      {showModal && selectedJockey && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl w-full max-w-md p-8">
            <h3 className="font-bold text-xl mb-6">Write Invitation</h3>

            <div className="space-y-5">
              <div>
                <label className="block text-sm text-slate-500 mb-2">
                  Title
                </label>
                <input
                  value={inviteTitle}
                  onChange={(e) => setInviteTitle(e.target.value)}
                  placeholder="e.g. Invitation for Race 5"
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:border-[#064E3B]"
                />
              </div>

              <div>
                <label className="block text-sm text-slate-500 mb-2">
                  Message
                </label>
                <textarea
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  rows={4}
                  placeholder="Write a short message to the jockey..."
                  className="w-full border border-slate-200 rounded-2xl px-4 py-3 focus:border-[#064E3B] resize-y"
                />
              </div>
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3 border rounded-2xl font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={sending}
                className="flex-1 py-3 bg-[#064E3B] text-white rounded-2xl font-bold disabled:opacity-50"
              >
                {sending ? "Sending..." : "Send Invitation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
