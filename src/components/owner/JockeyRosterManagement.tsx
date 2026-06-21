import { cn } from "../../lib/utils";
import type {
  Horse,
  TournamentRegistration,
  Tournament,
  Jockey,
  Invitation,
} from "../../hooks/useOwner";

export interface JockeyRosterManagementProps {
  horses: Horse[];
  registrations: TournamentRegistration[];
  tournaments: Tournament[];
  jockeys: Jockey[];
  invitations: Invitation[];
  onOpenInviteModal: (horseId: string, tournamentId: number) => void;
  onConfirmPairing: (invId: number) => void;
  onCancelInvite: (invId: number) => void;
}

export function JockeyRosterManagement({
  horses,
  registrations,
  tournaments,
  jockeys,
  invitations,
  onOpenInviteModal,
  onConfirmPairing,
  onCancelInvite,
}: JockeyRosterManagementProps) {
  const approved = registrations.filter(
    (r: TournamentRegistration) => r.status === "approved"
  );

  return (
    <div className="p-5 space-y-5 max-w-6xl mx-auto">
      <h2 className="text-xl font-black text-[#064E3B]">Jockey Roster</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {approved.map((reg: TournamentRegistration) => {
          const horse = horses.find((h: Horse) => h.id === reg.horseId);
          const tournament = tournaments.find(
            (t: Tournament) => t.id === reg.tournamentId
          );
          if (!horse || !tournament) return null;

          const invites = invitations.filter(
            (i: Invitation) =>
              i.horseId === reg.horseId &&
              i.tournamentId === Number(reg.tournamentId)
          );
          const locked = invites.find(
            (i: Invitation) => i.status === "Confirmed"
          );

          return (
            <div
              key={reg.id}
              className="bg-white border rounded-xl p-4 shadow-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-bold text-sm text-[#064E3B]">
                    {horse.name}
                  </h4>
                  <p className="text-[10px] text-slate-400">
                    {tournament.name}
                  </p>
                </div>
                {locked ? (
                  <span className="bg-emerald-50 text-emerald-800 text-[8px] font-black uppercase px-2 py-0.5 rounded">
                    Locked
                  </span>
                ) : (
                  <button
                    onClick={() =>
                      onOpenInviteModal(horse.id, Number(tournament.id))
                    }
                    className="rounded-lg bg-[#064E3B] text-white px-2.5 py-1.5 text-[10px] font-bold"
                  >
                    Hire Jockey
                  </button>
                )}
              </div>

              <div className="space-y-1.5 pt-2 mt-3 border-t">
                {invites.map((inv: Invitation) => {
                  const jockey = jockeys.find(
                    (j: Jockey) => j.id === inv.jockeyId
                  );
                  return (
                    <div
                      key={inv.id}
                      className="p-2 bg-slate-50 border rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="font-bold text-slate-700 text-xs">
                          {jockey?.name}
                        </p>
                        <span className="text-[9px] text-slate-400">
                          {jockey?.club}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "text-[8px] font-black uppercase px-1.5 py-0.5 rounded border",
                            inv.status === "Confirmed" &&
                              "bg-emerald-50 border-emerald-200 text-emerald-800",
                            inv.status === "Accepted" &&
                              "bg-blue-50 border-blue-200 text-blue-800",
                            inv.status === "Pending" &&
                              "bg-amber-50 border-amber-200 text-amber-800"
                          )}
                        >
                          {inv.status}
                        </span>
                        {inv.status === "Accepted" && !locked && (
                          <button
                            onClick={() => onConfirmPairing(Number(inv.id))}
                            className="rounded bg-emerald-600 text-white px-2 py-0.5 text-[9px] font-bold"
                          >
                            Lock
                          </button>
                        )}
                        {inv.status === "Pending" && (
                          <button
                            onClick={() => onCancelInvite(Number(inv.id))}
                            className="text-rose-600 text-[10px] font-bold"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
