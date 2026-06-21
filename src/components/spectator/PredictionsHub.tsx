import React, { useState } from "react";
import { Coins, ArrowRight, Clock } from "lucide-react";

interface PredictionsHubProps {
  addToast: (
    message: string,
    type: "success" | "error" | "info" | "warning"
  ) => void;
}

export function PredictionsHub({ addToast }: PredictionsHubProps) {
  const [selectedRunner, setSelectedRunner] = useState<string>("");
  const [stake, setStake] = useState<number | "">("");
  const [activeSubTab, setActiveSubTab] = useState<"Active" | "Historical">(
    "Active"
  );

  // Dynamic payouts calculation
  const getMultiplier = (runner: string) => {
    switch (runner) {
      case "shadowfax":
        return 4.0; // 3/1 odds -> stake + 3*stake = 4*stake
      case "silver-blaze":
        return 3.5; // 5/2 odds -> stake + 2.5*stake = 3.5*stake
      case "bucephalus":
        return 9.0; // 8/1 odds -> stake + 8*stake = 9*stake
      default:
        return 0;
    }
  };

  const getMultiplierLabel = (runner: string) => {
    switch (runner) {
      case "shadowfax":
        return "3/1";
      case "silver-blaze":
        return "5/2";
      case "bucephalus":
        return "8/1";
      default:
        return "--";
    }
  };

  const potentialPayout =
    selectedRunner && stake
      ? Math.round(Number(stake) * getMultiplier(selectedRunner))
      : "--";

  const handlePlacePrediction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRunner) {
      addToast("Please select a runner first.", "warning");
      return;
    }
    if (!stake || stake < 10) {
      addToast("Minimum stake amount is 10 tokens.", "warning");
      return;
    }

    const runnerName =
      selectedRunner === "shadowfax"
        ? "Shadowfax"
        : selectedRunner === "silver-blaze"
          ? "Silver Blaze"
          : "Bucephalus";
    addToast(
      `Successfully placed prediction: ${stake} TKNS on ${runnerName} (${getMultiplierLabel(selectedRunner)} odds).`,
      "success"
    );
    setSelectedRunner("");
    setStake("");
  };

  const activePredictions = [
    {
      event: "R4: Cheltenham",
      pick: "Desert Orchid",
      stake: 500,
      payout: 1250,
      status: "Live",
    },
    {
      event: "R5: Royal Ascot",
      pick: "Silver Blaze",
      stake: 250,
      payout: 875,
      status: "Scheduled",
    },
    {
      event: "R6: Epsom Derby",
      pick: "Red Rum",
      stake: 1000,
      payout: 4500,
      status: "Scheduled",
    },
  ];

  const historicalPredictions = [
    {
      event: "R3: Dubai World Cup",
      pick: "Thunderstrike",
      stake: 300,
      payout: 900,
      status: "Won",
    },
    {
      event: "R2: Belmont Stakes",
      pick: "Golden Boy",
      stake: 200,
      payout: 0,
      status: "Lost",
    },
    {
      event: "R1: Kentucky Derby Prep",
      pick: "Bourbon Legend",
      stake: 150,
      payout: 450,
      status: "Won",
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-6 max-w-7xl w-full mx-auto font-body">
      <div className="mb-6">
        <h2 className="font-headline text-3xl text-[#064E3B] mb-2">
          Predictions Hub
        </h2>
        <p className="text-sm text-slate-500 font-medium">
          Place your stakes and monitor live race outcomes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Predict Outcome Form (Left/Top) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-6 shadow-sm relative overflow-hidden">
            {/* Decorative Header Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#064E3B] to-[#EAB308]"></div>

            <div className="flex justify-between items-start mb-6">
              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#EAB308]/15 text-[#8A6D00] rounded-full font-label text-[10px] font-bold mb-2 border border-[#EAB308]/30">
                  <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-pulse"></span>
                  NEXT RACE
                </span>
                <h3 className="font-headline font-bold text-[#064E3B] text-lg">
                  R5: Royal Ascot
                </h3>
              </div>
              <span className="font-label text-xs text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 12:45
              </span>
            </div>

            <form onSubmit={handlePlacePrediction} className="space-y-5">
              {/* Select Horse */}
              <div>
                <label className="block font-label text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Select Runner
                </label>
                <div className="space-y-2">
                  {[
                    {
                      id: "shadowfax",
                      name: "Shadowfax",
                      label: "1. Shadowfax",
                      odds: "3/1",
                    },
                    {
                      id: "silver-blaze",
                      name: "Silver Blaze",
                      label: "2. Silver Blaze",
                      odds: "5/2",
                    },
                    {
                      id: "bucephalus",
                      name: "Bucephalus",
                      label: "3. Bucephalus",
                      odds: "8/1",
                    },
                  ].map((runner) => (
                    <label
                      key={runner.id}
                      className={`flex items-center justify-between p-3.5 border rounded-xl cursor-pointer hover:bg-slate-50 transition-all ${
                        selectedRunner === runner.id
                          ? "border-[#064E3B] bg-[#064E3B]/5 ring-1 ring-[#064E3B]"
                          : "border-slate-100"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="runner"
                          value={runner.id}
                          checked={selectedRunner === runner.id}
                          onChange={() => setSelectedRunner(runner.id)}
                          className="text-[#064E3B] focus:ring-[#064E3B] h-4 w-4 border-slate-300"
                        />
                        <span className="text-xs font-bold text-slate-700">
                          {runner.label}
                        </span>
                      </div>
                      <span className="font-label text-[10px] font-bold text-slate-400">
                        Odds: {runner.odds}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Stake Input */}
              <div>
                <label className="block font-label text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Stake Amount (Tokens)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400 pointer-events-none">
                    <Coins className="w-4 h-4" />
                  </span>
                  <input
                    type="number"
                    min="10"
                    step="10"
                    placeholder="Enter amount..."
                    value={stake}
                    onChange={(e) =>
                      setStake(
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                    className="block w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-1 focus:ring-[#064E3B] focus:border-[#064E3B] text-xs font-semibold transition-all"
                  />
                </div>
              </div>

              {/* Expected Return Preview */}
              <div className="bg-[#F4F6F5]/80 p-4 rounded-xl flex justify-between items-center border border-slate-100 shadow-inner">
                <span className="font-label text-xs font-bold text-slate-455">
                  Potential Payout
                </span>
                <span className="font-headline text-lg font-black text-[#064E3B] flex items-baseline gap-1">
                  {potentialPayout}{" "}
                  {potentialPayout !== "--" && (
                    <span className="text-xs font-bold font-body text-slate-550">
                      TKNS
                    </span>
                  )}
                </span>
              </div>

              <button
                type="submit"
                className="w-full bg-[#064E3B] text-white font-bold text-sm py-3 rounded-xl hover:bg-[#043E2F] hover:shadow-lg transition-all flex justify-center items-center gap-2 cursor-pointer"
              >
                Place Prediction
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* My Predictions Table (Right/Bottom) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white border border-[#064E3B]/10 rounded-2xl shadow-sm overflow-hidden flex flex-col">
            {/* Header & Tabs */}
            <div className="p-6 pb-0 border-b border-slate-100 bg-slate-50/20">
              <h3 className="font-headline font-bold text-[#064E3B] text-lg mb-4">
                My Predictions
              </h3>
              <div className="flex gap-6 border-b border-slate-100">
                <button
                  onClick={() => setActiveSubTab("Active")}
                  className={`pb-3 font-semibold text-sm transition-all relative ${
                    activeSubTab === "Active"
                      ? "text-[#064E3B] font-extrabold border-b-2 border-[#064E3B]"
                      : "text-slate-400 hover:text-slate-650"
                  }`}
                >
                  Active ({activePredictions.length})
                </button>
                <button
                  onClick={() => setActiveSubTab("Historical")}
                  className={`pb-3 font-semibold text-sm transition-all relative ${
                    activeSubTab === "Historical"
                      ? "text-[#064E3B] font-extrabold border-b-2 border-[#064E3B]"
                      : "text-slate-400 hover:text-slate-650"
                  }`}
                >
                  Historical ({historicalPredictions.length})
                </button>
              </div>
            </div>

            {/* Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/40">
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Pick
                    </th>
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      Stake
                    </th>
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-right">
                      Pot. Payout
                    </th>
                    <th className="py-3 px-6 font-label text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-700">
                  {(activeSubTab === "Active"
                    ? activePredictions
                    : historicalPredictions
                  ).map((row, idx) => (
                    <tr
                      key={idx}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="py-4 px-6 font-bold text-slate-800">
                        {row.event}
                      </td>
                      <td className="py-4 px-6 text-slate-500">{row.pick}</td>
                      <td className="py-4 px-6 text-right font-mono text-slate-600">
                        {row.stake}
                      </td>
                      <td className="py-4 px-6 text-right font-mono text-[#064E3B] font-bold">
                        {row.payout}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full font-label text-[9px] font-bold uppercase border ${
                            row.status === "Live"
                              ? "bg-amber-50 border-amber-200 text-amber-800 animate-pulse"
                              : row.status === "Scheduled"
                                ? "bg-slate-50 border-slate-200 text-slate-500"
                                : row.status === "Won"
                                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                                  : "bg-rose-50 border-rose-200 text-rose-800"
                          }`}
                        >
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
