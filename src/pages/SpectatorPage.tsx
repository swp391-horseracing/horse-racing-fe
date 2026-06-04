import { useState, useMemo } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import {
  Trophy,
  Coins,
  History,
  Timer,
  Play,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Wallet,
  ShieldCheck,
  Zap,
} from "lucide-react";

// ─── Type Definitions ────────────────────────────────────────────────────────

interface ParticipantHorse {
  name: string;
  jockey: string;
  odds: number;
  winRate: string;
}

interface SpectatorRace {
  id: string;
  tournamentName: string;
  raceName: string;
  trackType: "Turf" | "Dirt";
  distance: string;
  status: "Scheduled" | "Live" | "Concluded" | "Published";
  postTime: string;
  horses: ParticipantHorse[];
}

interface PredictionRecord {
  id: string;
  raceId: string;
  raceName: string;
  horseName: string;
  stake: number;
  odds: number;
  status: "Pending" | "Won" | "Lost";
  payout: number;
  date: string;
}

interface LedgerEntry {
  id: string;
  type: "Genesis Drop" | "IAP Deposit" | "Prediction Stake" | "Reward Payout";
  amount: number;
  date: string;
  reference: string;
}

// ─── Initial Seed / Mock Database ─────────────────────────────────────────────

const MOCK_RACES: SpectatorRace[] = [
  {
    id: "r-101",
    tournamentName: "Royal Cup 2026",
    raceName: "Race 3 — Elite Turf Sprint",
    trackType: "Turf",
    distance: "1200m",
    status: "Scheduled",
    postTime: "Today, 14:00",
    horses: [
      { name: "Thunder Bolt", jockey: "Michael Lee", odds: 2.2, winRate: "72%" },
      { name: "Silver Storm", jockey: "David Kim", odds: 3.5, winRate: "61%" },
      { name: "Midnight Majesty", jockey: "Trần Trí Đức", odds: 5.0, winRate: "48%" },
    ],
  },
  {
    id: "r-102",
    tournamentName: "Grand Prix Spring",
    raceName: "Race 5 — Muddy Grounds Classic",
    trackType: "Dirt",
    distance: "1600m",
    status: "Scheduled",
    postTime: "Today, 16:30",
    horses: [
      { name: "Dark Phantom", jockey: "Chris Evans", odds: 1.8, winRate: "81%" },
      { name: "Gilded Gallop", jockey: "Chu Minh Đức", odds: 4.2, winRate: "54%" },
      { name: "Desert Wind", jockey: "Nguyen Khoa", odds: 8.5, winRate: "33%" },
    ],
  },
  {
    id: "r-103",
    tournamentName: "National Derby",
    raceName: "Race 1 — Golden Sands Sprint",
    trackType: "Dirt",
    distance: "1000m",
    status: "Live",
    postTime: "Started 3m ago",
    horses: [
      { name: "Thunder Blaze", jockey: "Lord Alistair", odds: 2.1, winRate: "65%" },
      { name: "Silver Wind", jockey: "Marcus Vance", odds: 3.0, winRate: "59%" },
    ],
  },
];

const INITIAL_PREDICTIONS: PredictionRecord[] = [
  {
    id: "pred-901",
    raceId: "r-100",
    raceName: "Race 2 — Pre-Season Trial",
    horseName: "Silver Storm",
    stake: 200,
    odds: 3.2,
    status: "Won",
    payout: 640,
    date: "2026-06-02T10:15:00Z",
  },
  {
    id: "pred-902",
    raceId: "r-100",
    raceName: "Race 2 — Pre-Season Trial",
    horseName: "Dark Phantom",
    stake: 150,
    odds: 2.1,
    status: "Lost",
    payout: 0,
    date: "2026-06-02T10:15:00Z",
  },
];

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    id: "tx-001",
    type: "Genesis Drop",
    amount: 1000,
    date: "2026-06-01T08:00:00Z",
    reference: "System Welcome Bonus (BR-BET-05)",
  },
  {
    id: "tx-002",
    type: "Prediction Stake",
    amount: -200,
    date: "2026-06-02T10:10:00Z",
    reference: "Escrowed on Silver Storm",
  },
  {
    id: "tx-003",
    type: "Prediction Stake",
    amount: -150,
    date: "2026-06-02T10:11:00Z",
    reference: "Escrowed on Dark Phantom",
  },
  {
    id: "tx-004",
    type: "Reward Payout",
    amount: 640,
    date: "2026-06-02T11:45:00Z",
    reference: "Published Payout (BR-BET-04)",
  },
];

export default function SpectatorPage() {
  // Sync page state with routing structure keys mapped inside UserLayout (Active state handles navigation)
  const [active, setActive] = useState<string>(ROUTES.SPECTATOR_DASHBOARD);

  // ─── Closed-Loop Wallet Ledger States (BR-BET-01) ───────────────────────
  const [balance, setBalance] = useState<number>(1290);
  const [predictions, setPredictions] = useState<PredictionRecord[]>(INITIAL_PREDICTIONS);
  const [ledger, setLedger] = useState<LedgerEntry[]>(INITIAL_LEDGER);

  // ─── Modal and Notification States ──────────────────────────────────────────
  const [selectedRace, setSelectedRace] = useState<SpectatorRace | null>(null);
  const [selectedHorse, setSelectedHorse] = useState<ParticipantHorse | null>(null);
  const [stakeValue, setStakeValue] = useState<string>("");
  const [showPredictionModal, setShowPredictionModal] = useState<boolean>(false);
  const [showTopUpModal, setShowTopUpModal] = useState<boolean>(false);
  
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" | "warning" | "info" }[]>([]);

  const addToast = (message: string, type: "success" | "error" | "warning" | "info" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // UC-SP-03: Prediction Form Init
  const handleOpenPredictionModal = (race: SpectatorRace, horse: ParticipantHorse) => {
    if (race.status !== "Scheduled") {
      addToast("Prediction Error: Outcomes can only be placed on Scheduled matches (BR-BET-02).", "error");
      return;
    }
    setSelectedRace(race);
    setSelectedHorse(horse);
    setStakeValue("");
    setShowPredictionModal(true);
  };

  const handleConfirmPrediction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRace || !selectedHorse) return;

    const stake = Number(stakeValue);

    if (isNaN(stake) || stake <= 0) {
      addToast("Input Error: Please enter a valid stake coefficient.", "error");
      return;
    }

    if (stake > balance) {
      addToast("Insufficient Funds: Selected stake exceeds available wallet balance.", "error");
      return;
    }

    // Atomic Stake Escrow Deduction (BR-BET-03)
    const newPrediction: PredictionRecord = {
      id: `pred-${Date.now()}`,
      raceId: selectedRace.id,
      raceName: selectedRace.raceName,
      horseName: selectedHorse.name,
      stake,
      odds: selectedHorse.odds,
      status: "Pending",
      payout: 0,
      date: new Date().toISOString(),
    };

    const newTx: LedgerEntry = {
      id: `tx-${Date.now()}`,
      type: "Prediction Stake",
      amount: -stake,
      date: new Date().toISOString(),
      reference: `Escrowed on ${selectedHorse.name}`,
    };

    setBalance((prev) => prev - stake);
    setPredictions((prev) => [newPrediction, ...prev]);
    setLedger((prev) => [newTx, ...prev]);
    setShowPredictionModal(false);

    addToast(`Outcome prediction confirmed. ${stake} tokens escrowed.`, "success");
  };

  // Simulated Sandbox Deposit (BR-BET-01)
  const handleExecuteIAP = (amount: number) => {
    const tx: LedgerEntry = {
      id: `tx-${Date.now()}`,
      type: "IAP Deposit",
      amount,
      date: new Date().toISOString(),
      reference: "VNPay Sandbox Top-Up (Zero Real-World Fiat Value)",
    };

    setBalance((prev) => prev + amount);
    setLedger((prev) => [tx, ...prev]);
    setShowTopUpModal(false);
    addToast(`Replenished wallet. Added ${amount} Virtual Tokens.`, "success");
  };

  const activeEscrowPredictions = useMemo(() => {
    return predictions.filter((p) => p.status === "Pending");
  }, [predictions]);

  const resolvedPredictions = useMemo(() => {
    return predictions.filter((p) => p.status !== "Pending");
  }, [predictions]);

  const renderContent = () => {
    switch (active) {
      case ROUTES.SPECTATOR_DASHBOARD:
        return (
          <ArenaOverview rList={MOCK_RACES} onPredict={handleOpenPredictionModal} />
        );
      case "/spectator/predictions":
        return (
          <PredictionsHub
            active={activeEscrowPredictions}
            resolved={resolvedPredictions}
            ledger={ledger}
          />
        );
      default:
        return null;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={setActive}>
      <div className="h-full w-full relative flex flex-col overflow-hidden bg-[#F4F6F5] font-body">
        
        {/* Floating Toasts container */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-2.5 pointer-events-auto transform animate-in slide-in-from-top duration-200 text-xs font-semibold",
                t.type === "success" && "bg-emerald-50 border-emerald-300 text-emerald-955",
                t.type === "error" && "bg-rose-50 border-rose-300 text-rose-955",
                t.type === "warning" && "bg-amber-50 border-amber-300 text-amber-955",
                t.type === "info" && "bg-indigo-50 border-indigo-300 text-indigo-955"
              )}
            >
              <span className="shrink-0 mt-0.5">
                {t.type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                {t.type === "error" && <XCircle className="w-4 h-4 text-rose-600" />}
                {t.type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-600" />}
                {t.type === "info" && <ShieldCheck className="w-4 h-4 text-indigo-600" />}
              </span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        {/* Closed Loop Currency Header Section */}
        <div className="bg-white border-b border-[#064E3B]/10 px-6 py-3 shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#064E3B]/5 text-[#064E3B]">
              <Wallet className="w-4 h-4" />
            </span>
            <div>
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Simulated Balance</p>
              <p className="text-sm font-black text-[#064E3B] font-label">{balance.toLocaleString()} Tokens</p>
            </div>
          </div>

          <button
            onClick={() => setShowTopUpModal(true)}
            className="flex items-center gap-1 bg-[#EAB308] hover:bg-[#d9a407] text-[#064E3B] font-extrabold px-3 py-1.5 rounded-lg text-xs transition shadow-sm"
          >
            <Coins className="w-3.5 h-3.5" /> Replenish Tokens
          </button>
        </div>

        {/* Render View Area */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {renderContent()}
        </div>

        {/* MODAL 1: UC-SP-03 Prediction Placement Form */}
        {showPredictionModal && selectedRace && selectedHorse && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 max-w-sm w-full shadow-2xl">
              <div className="flex items-center justify-between border-b pb-2.5 mb-3.5">
                <div className="text-left">
                  <h3 className="font-bold text-base text-[#064E3B] font-headline">Outcome Prediction</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">{selectedRace.tournamentName}</p>
                </div>
                <button onClick={() => setShowPredictionModal(false)} className="text-slate-400 text-sm">✕</button>
              </div>

              <form onSubmit={handleConfirmPrediction} className="space-y-4">
                <div className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                  <p className="font-semibold text-slate-500">Horse:</p>
                  <p className="font-bold text-[#064E3B] text-sm">{selectedHorse.name}</p>
                  <p className="text-slate-455 text-[10px]">Jockey: {selectedHorse.jockey} • Odds: {selectedHorse.odds}x</p>
                </div>

                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Prediction Stake</label>
                  <input
                    type="number"
                    required
                    value={stakeValue}
                    onChange={(e) => setStakeValue(e.target.value)}
                    placeholder="Stake e.g. 200"
                    className="w-full bg-slate-50 border rounded-lg p-2.5 text-xs outline-none focus:border-[#064E3B] font-label"
                  />
                  <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-bold">
                    <span>Balance: {balance} Tokens</span>
                    {Number(stakeValue) > 0 && (
                      <span className="text-emerald-700">Possible Return: {Math.floor(Number(stakeValue) * selectedHorse.odds)} Tokens</span>
                    )}
                  </div>
                </div>

                <div className="bg-amber-50/50 border border-amber-200/50 p-2.5 rounded-lg flex items-start gap-2 text-[10px] text-amber-850">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <p>Strict virtual currency system limit: All transactions occur closed-loop. Withdrawal/Fiat payout channels are blocked (BR-BET-01).</p>
                </div>

                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                  <button type="button" onClick={() => setShowPredictionModal(false)} className="rounded-lg border px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-50">Cancel</button>
                  <button type="submit" className="rounded-lg bg-[#064E3B] hover:bg-[#043E2F] text-white px-4 py-1.5 text-xs font-bold shadow-sm">Confirm Stake</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: Simulated Top-Up Sandbox Form (BR-BET-01) */}
        {showTopUpModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 max-w-sm w-full shadow-2xl text-center space-y-4">
              <div className="flex items-center justify-between border-b pb-2 mb-1">
                <h3 className="font-bold text-sm text-[#064E3B]">VNPay Sandbox Gateway</h3>
                <button onClick={() => setShowTopUpModal(false)} className="text-slate-400 text-sm">✕</button>
              </div>

              <div className="space-y-1.5">
                <div className="h-10 w-10 rounded-full bg-[#EAB308]/10 text-[#EAB308] flex items-center justify-center mx-auto">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">Top-Up Simulated Sandbox</h4>
                <p className="text-[10px] text-slate-450 leading-relaxed px-2">VNPay mock interface generates closed-loop system test tokens with zero fiat worth.</p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleExecuteIAP(500)}
                  className="p-3 border hover:border-[#064E3B] hover:bg-[#064E3B]/5 rounded-xl text-left"
                >
                  <p className="font-bold text-[#064E3B] text-xs">+500 Tokens</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">VNPay Test Sandbox</p>
                </button>
                <button
                  onClick={() => handleExecuteIAP(1000)}
                  className="p-3 border hover:border-[#064E3B] hover:bg-[#064E3B]/5 rounded-xl text-left"
                >
                  <p className="font-bold text-[#064E3B] text-xs">+1000 Tokens</p>
                  <p className="text-[9px] text-slate-400 mt-0.5">VNPay Test Sandbox</p>
                </button>
              </div>

              <button
                onClick={() => setShowTopUpModal(false)}
                className="w-full rounded-lg border py-2 text-xs font-semibold text-slate-400 hover:bg-slate-50 mt-2"
              >
                Close Gateway
              </button>
            </div>
          </div>
        )}

      </div>
    </UserLayout>
  );
}

// ─── Sub-Component 1: ArenaOverview ─────────────────────────────────────────

function ArenaOverview({
  rList,
  onPredict,
}: {
  rList: SpectatorRace[];
  onPredict: (race: SpectatorRace, horse: ParticipantHorse) => void;
}) {
  return (
    <div className="p-5 space-y-5 max-w-5xl mx-auto font-body">
      
      <div className="flex items-center justify-between border-b border-[#064E3B]/10 pb-3">
        <div>
          <h2 className="text-lg font-black font-headline text-[#064E3B]">Interactive Race Arena</h2>
          <p className="text-[11px] text-slate-500 mt-0.5">Check current tournament matches, calculate returns, and lock predictions.</p>
        </div>
      </div>

      <div className="space-y-4">
        {rList.map((race) => (
          <div key={race.id} className="bg-white border rounded-2xl p-4.5 shadow-sm space-y-4">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[9px] text-[#064E3B] font-extrabold bg-[#064E3B]/10 px-2 py-0.5 rounded border border-[#064E3B]/20 uppercase">
                    {race.tournamentName}
                  </span>
                  <span className="text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-label uppercase font-semibold">
                    {race.trackType} • {race.distance}
                  </span>
                </div>
                <h3 className="font-extrabold font-headline text-base text-[#064E3B] mt-1.5">{race.raceName}</h3>
              </div>

              <div className="flex items-center gap-1.5">
                {race.status === "Live" ? (
                  <span className="flex items-center gap-1 rounded px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-rose-50 border border-rose-200 text-rose-700">
                    <Play className="w-2.5 h-2.5 fill-rose-700" /> Running Live
                  </span>
                ) : (
                  <span className="flex items-center gap-1 rounded px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-500 font-label">
                    <Timer className="w-3 h-3 text-slate-400" /> Lock Post: {race.postTime}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {race.horses.map((horse) => (
                <div
                  key={horse.name}
                  className="p-3 border rounded-xl bg-slate-50/40 hover:bg-slate-50 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-1 text-left">
                    <p className="font-black text-slate-800 text-sm leading-tight">{horse.name}</p>
                    <p className="text-[10px] text-slate-400">Jockey: {horse.jockey} • Win Rate: {horse.winRate}</p>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100/55">
                    <div className="text-left">
                      <span className="text-[9px] text-slate-400 uppercase font-black block">Odds</span>
                      <span className="font-bold text-[#064E3B] text-base font-label">{horse.odds}x</span>
                    </div>

                    <button
                      onClick={() => onPredict(race, horse)}
                      disabled={race.status !== "Scheduled"}
                      className={cn(
                        "rounded-lg px-3 py-1.5 text-[10px] font-bold shadow-sm transition",
                        race.status === "Scheduled"
                          ? "bg-[#064E3B] hover:bg-[#043E2F] text-white"
                          : "bg-slate-100 text-slate-450 cursor-not-allowed"
                      )}
                    >
                      Predict
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}

// ─── Sub-Component 2: PredictionsHub ──────────────────────────────────────────

function PredictionsHub({
  active,
  resolved,
  ledger,
}: {
  active: PredictionRecord[];
  resolved: PredictionRecord[];
  ledger: LedgerEntry[];
}) {
  const [panel, setPanel] = useState<"escrow" | "history" | "ledger">("escrow");

  return (
    <div className="p-5 space-y-5 max-w-5xl mx-auto font-body">
      
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        {[
          { key: "escrow", label: "Active Predictions" },
          { key: "history", label: "Settled History" },
          { key: "ledger", label: "Transaction Ledger" },
        ].map((item) => (
          <button
            key={item.key}
            onClick={() => setPanel(item.key as "escrow" | "history" | "ledger")}
            className={cn(
              "rounded-xl px-3.5 py-2 text-xs font-bold whitespace-nowrap transition",
              panel === item.key
                ? "bg-[#064E3B] text-white shadow-md"
                : "bg-white border text-slate-500 hover:bg-slate-100"
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="bg-white border rounded-2xl p-4.5 shadow-sm min-h-64">
        
        {panel === "escrow" && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">Active Predictions (In Escrow)</h3>
            {active.length === 0 ? (
              <p className="text-xs text-slate-450 italic text-center py-8">No predictions pending settlement.</p>
            ) : (
              <div className="divide-y">
                {active.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{p.horseName}</p>
                      <p className="text-[10px] text-slate-400">{p.raceName} • Odds: {p.odds}x</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold font-label text-slate-700">{p.stake} Tokens Stake</p>
                      <span className="inline-block text-[8px] uppercase tracking-wider font-extrabold bg-amber-50 border border-amber-200 text-amber-700 px-1.5 py-0.5 rounded mt-0.5">
                        In Escrow
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {panel === "history" && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">Prediction Settlement History</h3>
            {resolved.length === 0 ? (
              <p className="text-xs text-slate-450 italic text-center py-8">No settled predictions in history.</p>
            ) : (
              <div className="divide-y">
                {resolved.map((p) => (
                  <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-slate-800">{p.horseName}</p>
                      <p className="text-[10px] text-slate-400">{p.raceName} • Odds: {p.odds}x</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="font-bold font-label text-slate-700">{p.stake} Tokens Stake</p>
                      {p.status === "Won" ? (
                        <span className="flex items-center gap-0.5 text-[9px] text-emerald-700 font-extrabold mt-1">
                          <Trophy className="w-3.5 h-3.5 text-[#EAB308]" /> Return: +{p.payout}
                        </span>
                      ) : (
                        <span className="text-[9px] text-rose-600 font-bold mt-1">Lost: -{p.stake}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {panel === "ledger" && (
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">Audited Token Transactions Ledger</h3>
            <div className="divide-y divide-slate-100 overflow-x-auto">
              {ledger.map((entry) => (
                <div key={entry.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "rounded px-1.5 py-0.5 text-[8px] font-black uppercase tracking-wider border",
                        entry.type === "Genesis Drop" && "bg-indigo-50 border-indigo-200 text-indigo-700",
                        entry.type === "IAP Deposit" && "bg-emerald-50 border-emerald-200 text-emerald-700",
                        entry.type === "Prediction Stake" && "bg-amber-50 border-amber-200 text-amber-700",
                        entry.type === "Reward Payout" && "bg-violet-50 border-violet-200 text-violet-700"
                      )}>
                        {entry.type}
                      </span>
                    </div>
                    <p className="text-slate-555 text-[10px] mt-1 font-semibold">{entry.reference}</p>
                  </div>
                  
                  <div className="text-left sm:text-right font-label shrink-0">
                    <span className={cn(
                      "font-black text-sm block",
                      entry.amount >= 0 ? "text-emerald-700" : "text-slate-700"
                    )}>
                      {entry.amount >= 0 ? `+${entry.amount}` : entry.amount}
                    </span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">
                      {new Date(entry.date).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

    </div>
  );
}