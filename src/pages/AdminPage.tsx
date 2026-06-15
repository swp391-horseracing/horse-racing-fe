// src/pages/AdminPage.tsx
import { useState } from "react";
import UserLayout from "../layouts/UserLayout";
import { ROUTES } from "../router/routes.tsx";
import { cn } from "../lib/utils";
import {
  ShieldAlert,
  ClipboardCheck,
  Calendar,
  TrendingUp,
  Settings,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Activity,
  Lock,
  Flag,
  ShieldCheck,
} from "lucide-react";

// ─── Type Definitions & Mocks ────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning" | "info";
type Toast = { id: number; message: string; type: ToastType };

export default function AdminPage() {
  const [active, setActive] = useState<string>(ROUTES.ADMIN_DASHBOARD);
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Toast Trigger
  const addToast = (message: string, type: ToastType = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const renderContent = () => {
    switch (active) {
      case ROUTES.ADMIN_DASHBOARD:
        return <ControlCenterOverview setActiveTab={setActive} />;
      case "/admin/access":
        return <AccessManagement addToast={addToast} />;
      case "/admin/registry":
        return <RegistryApprovals addToast={addToast} />;
      case "/admin/tournaments":
        return <TournamentRaceManager addToast={addToast} />;
      case "/admin/economy":
        return <VirtualEconomy addToast={addToast} />;
      default:
        return <ControlCenterOverview setActiveTab={setActive} />;
    }
  };

  return (
    <UserLayout activeKey={active} onActiveKeyChange={setActive}>
      <div className="h-full w-full relative flex flex-col overflow-hidden">
        {/* Floating Toasts */}
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={cn(
                "p-3.5 rounded-xl border shadow-xl backdrop-blur-md flex items-start gap-2.5 pointer-events-auto transform animate-in slide-in-from-top duration-200 text-xs font-semibold",
                t.type === "success" &&
                  "bg-emerald-50 border-emerald-300 text-emerald-900",
                t.type === "error" &&
                  "bg-rose-50 border-rose-300 text-rose-900",
                t.type === "warning" &&
                  "bg-amber-50 border-amber-300 text-amber-900",
                t.type === "info" &&
                  "bg-indigo-50 border-indigo-300 text-indigo-900"
              )}
            >
              <span className="shrink-0 mt-0.5">
                {t.type === "success" && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                )}
                {t.type === "error" && (
                  <XCircle className="w-4 h-4 text-rose-600" />
                )}
                {t.type === "warning" && (
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                )}
                {t.type === "info" && (
                  <Activity className="w-4 h-4 text-indigo-600" />
                )}
              </span>
              <span>{t.message}</span>
            </div>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="flex-1 overflow-y-auto min-h-0">{renderContent()}</div>
      </div>
    </UserLayout>
  );
}

// ─── Sub-Component 1: Control Center Overview ────────────────────────────────

function ControlCenterOverview({
  setActiveTab,
}: {
  setActiveTab: (t: string) => void;
}) {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto h-full">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-2xl font-black font-headline text-[#064E3B] tracking-tight">
          System Control Panel
        </h2>
        <p className="text-xs text-slate-500 font-semibold mt-1">
          High-level overview of platform operations, security logs, and pending
          tasks.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          {
            label: "Pending Approvals",
            val: "14",
            icon: <ClipboardCheck />,
            action: "/admin/registry",
            color: "text-[#D97706]",
            bg: "bg-[#D97706]/10",
          },
          {
            label: "Active Tournaments",
            val: "3",
            icon: <Calendar />,
            action: "/admin/tournaments",
            color: "text-[#064E3B]",
            bg: "bg-[#064E3B]/10",
          },
          {
            label: "System Alerts",
            val: "2",
            icon: <ShieldAlert />,
            action: "/admin/access",
            color: "text-rose-600",
            bg: "bg-rose-100",
          },
          {
            label: "Escrowed Tokens",
            val: "1.2M",
            icon: <TrendingUp />,
            action: "/admin/economy",
            color: "text-indigo-600",
            bg: "bg-indigo-100",
          },
        ].map((stat, idx) => (
          <div
            key={idx}
            onClick={() => setActiveTab(stat.action)}
            className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm hover:shadow-md transition cursor-pointer relative overflow-hidden group"
          >
            <div
              className={`absolute right-0 bottom-0 translate-y-2 translate-x-2 opacity-10 group-hover:scale-110 duration-500 ${stat.color}`}
            >
              {stat.icon}
            </div>
            <span className="text-[10px] text-slate-400 uppercase font-black block">
              {stat.label}
            </span>
            <span
              className={cn(
                "text-2xl font-black font-headline mt-1.5 block tracking-tight",
                stat.color
              )}
            >
              {stat.val}
            </span>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Audit Log (UC-AD-01 / UC-AD-02) */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2 flex justify-between items-center">
            <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
              <Lock className="w-4 h-4" /> Admin Audit Log
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold uppercase">
              Live
            </span>
          </div>
          <div className="space-y-3">
            {[
              {
                action: "Account Suspended",
                target: "Jockey_092",
                admin: "Admin_01",
                time: "10 mins ago",
              },
              {
                action: "Role Upgraded",
                target: "User_44 (To Referee)",
                admin: "Admin_01",
                time: "1 hour ago",
              },
              {
                action: "Results Published",
                target: "Race #421",
                admin: "Admin_03",
                time: "3 hours ago",
              },
            ].map((log, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div>
                  <p className="font-bold text-slate-800">{log.action}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Target: {log.target} • By {log.admin}
                  </p>
                </div>
                <span className="text-[9px] font-label text-slate-400 font-bold">
                  {log.time}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pending Action Highlights */}
        <div className="bg-white border border-[#064E3B]/10 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-2">
            <h3 className="font-bold font-headline text-md text-[#064E3B] flex items-center gap-2">
              <Activity className="w-4 h-4" /> Required Actions
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-3 border border-amber-200 bg-amber-50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-amber-800">
                  Pending Results Publication
                </p>
                <p className="text-[10px] text-amber-600 mt-0.5">
                  Race #112 concluded. Referee report waiting for sign-off.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("/admin/tournaments")}
                className="text-[10px] font-bold bg-amber-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-amber-700"
              >
                Review
              </button>
            </div>
            <div className="flex justify-between items-center p-3 border border-indigo-200 bg-indigo-50 rounded-xl">
              <div>
                <p className="text-xs font-bold text-indigo-800">
                  7 Registration Profiles Pending
                </p>
                <p className="text-[10px] text-indigo-600 mt-0.5">
                  Horse Owners and Jockeys awaiting verification.
                </p>
              </div>
              <button
                onClick={() => setActiveTab("/admin/registry")}
                className="text-[10px] font-bold bg-indigo-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:bg-indigo-700"
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Component 2: Access Management (UC-AD-01, UC-AD-02) ─────────────────

function AccessManagement({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto h-full">
      <div className="flex items-center justify-between border-b border-[#064E3B]/10 pb-4">
        <div>
          <h2 className="text-xl font-black font-headline text-[#064E3B]">
            Access Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage user accounts, assign roles, and handle suspensions
            (UC-AD-01, UC-AD-02).
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username or email..."
              className="w-full bg-slate-50 border rounded-xl pl-9 pr-4 py-2 text-xs focus:border-[#064E3B] outline-none"
            />
          </div>
          <select className="bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 outline-none">
            <option>All Roles</option>
            <option>Spectators</option>
            <option>Owners</option>
            <option>Jockeys</option>
            <option>Referees</option>
          </select>
        </div>

        <div className="border rounded-xl overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b text-slate-500 font-bold uppercase text-[9px] tracking-wider">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Role</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[
                {
                  name: "John Doe",
                  email: "john@stable.com",
                  role: "Owner",
                  status: "Active",
                },
                {
                  name: "Sarah Smith",
                  email: "sarah@track.com",
                  role: "Registered User",
                  status: "Active",
                },
                {
                  name: "Tom Jenkins",
                  email: "tom@jockeys.org",
                  role: "Jockey",
                  status: "Suspended",
                },
              ].map((u, i) => (
                <tr key={i} className="hover:bg-slate-50/50">
                  <td className="p-3">
                    <p className="font-bold text-slate-800">{u.name}</p>
                    <p className="text-[10px] text-slate-400">{u.email}</p>
                  </td>
                  <td className="p-3 font-semibold text-slate-600">{u.role}</td>
                  <td className="p-3">
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded text-[9px] font-black uppercase",
                        u.status === "Active"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      )}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="p-3 text-right space-x-2">
                    {u.role === "Registered User" && (
                      <button
                        onClick={() =>
                          addToast(
                            "Role updated to Race Referee. Session invalidated.",
                            "info"
                          )
                        }
                        className="text-[10px] font-bold bg-[#064E3B]/10 text-[#064E3B] px-2.5 py-1.5 rounded hover:bg-[#064E3B]/20 transition"
                      >
                        Assign Referee
                      </button>
                    )}
                    {u.status === "Active" ? (
                      <button
                        onClick={() =>
                          addToast(
                            "Account suspended. Active tokens destroyed.",
                            "warning"
                          )
                        }
                        className="text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-200 px-2.5 py-1.5 rounded hover:bg-rose-100 transition"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          addToast("Account restored to Active.", "success")
                        }
                        className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1.5 rounded hover:bg-emerald-100 transition"
                      >
                        Restore
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Component 3: Registry & Approvals (UC-AD-05) ────────────────────────

function RegistryApprovals({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto h-full">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-xl font-black font-headline text-[#064E3B]">
          Verification & Registration Queue
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Review plain-text profiles and tournament entry submissions
          (UC-AD-05).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profiles Queue */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Pending Alphanumeric Profiles
          </h3>
          <div className="space-y-3">
            <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    New Jockey Application
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Submitted 2 hours ago
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                  Pending
                </span>
              </div>
              <div className="text-[10px] bg-white p-2 rounded border border-slate-100 font-label text-slate-600">
                <p>Legal Name: Marcus Silva</p>
                <p>Club: Elite Riders Assoc.</p>
                <p>License ID: JCK-9941-XYZ</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    addToast("Profile Approved. Status Active.", "success")
                  }
                  className="flex-1 bg-[#064E3B] text-white text-xs font-bold py-1.5 rounded-lg shadow-sm hover:bg-[#043E2F]"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    addToast("Profile Rejected. Notification sent.", "error")
                  }
                  className="flex-1 bg-white border border-slate-200 text-rose-600 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-50"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tournament Entries Queue */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Pending Tournament Entries
          </h3>
          <div className="space-y-3">
            <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold text-slate-800">
                    Horse: Thunderbolt (TB)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Target: Elite Turf Season
                  </p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-[9px] px-2 py-0.5 rounded font-black uppercase">
                  Pending
                </span>
              </div>
              <div className="text-[10px] bg-white p-2 rounded border border-slate-100 font-label text-slate-600">
                <p>Owner: John Doe</p>
                <p>Microchip ID: 199304000123</p>
                <p>
                  Eligibility Check:{" "}
                  <span className="text-emerald-600">Passed</span>
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addToast("Horse Entry Approved.", "success")}
                  className="flex-1 bg-[#064E3B] text-white text-xs font-bold py-1.5 rounded-lg shadow-sm hover:bg-[#043E2F]"
                >
                  Approve
                </button>
                <button
                  onClick={() =>
                    addToast("Entry Waitlisted due to capacity.", "warning")
                  }
                  className="flex-1 bg-white border border-slate-200 text-amber-600 text-xs font-bold py-1.5 rounded-lg hover:bg-slate-50"
                >
                  Waitlist
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Component 4: Tournament & Race Manager (UC-AD-03, 04, 07, 08) ───────

function TournamentRaceManager({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto h-full">
      <div className="border-b border-[#064E3B]/10 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-xl font-black font-headline text-[#064E3B]">
            Tournament & Track Operations
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage schedules, assign referees, and publish results.
          </p>
        </div>
        <button className="bg-[#064E3B] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#043E2F] flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" /> Create Tournament
        </button>
      </div>

      {/* Pending Publication Card (UC-AD-08) */}
      <div className="bg-gradient-to-r from-amber-50 to-amber-100/50 border border-amber-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h3 className="font-bold text-amber-900 text-sm flex items-center gap-2">
            <Flag className="w-4 h-4" /> Results Pending Publication
          </h3>
          <p className="text-[11px] text-amber-700 mt-1">
            Referee 'Ref_Smith' has submitted the final report for Race #42
            (Concluded).
          </p>
        </div>
        <button
          onClick={() =>
            addToast(
              "Results Published. Virtual Economy updated (BR-BET-04).",
              "success"
            )
          }
          className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:bg-amber-700 shrink-0"
        >
          Publish Official Results
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Race Scheduler (UC-AD-04, 07) */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Upcoming Scheduled Races
          </h3>

          <div className="p-4 border border-slate-200 rounded-xl space-y-3 relative overflow-hidden">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-[#064E3B] text-sm">
                  Championship Stakes - Round 1
                </p>
                <p className="text-[10px] text-slate-500">
                  Scheduled: 14:00 PM Tomorrow
                </p>
              </div>
              <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[9px] font-black uppercase rounded">
                Scheduled
              </span>
            </div>

            <div className="bg-slate-50 p-2.5 rounded border border-slate-100 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Starting Lanes:</span>
              <span className="text-emerald-600 font-bold font-label">
                8/8 Filled
              </span>
            </div>

            <div className="flex items-center gap-3 border-t border-slate-100 pt-3">
              <div className="flex-1">
                <label className="text-[9px] uppercase font-bold text-slate-400 block mb-1">
                  Assigned Referee
                </label>
                <select className="w-full bg-slate-50 border border-slate-200 text-xs p-2 rounded-lg outline-none font-semibold text-slate-700">
                  <option>Ref_Smith (Active)</option>
                  <option>Ref_Jones (Active)</option>
                </select>
              </div>
              <button
                onClick={() =>
                  addToast("Referee assigned successfully.", "success")
                }
                className="mt-4 bg-[#064E3B]/10 text-[#064E3B] hover:bg-[#064E3B]/20 text-[10px] font-bold px-3 py-2 rounded-lg transition"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Tournament Management (UC-AD-03) */}
        <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2">
            Active Tournaments
          </h3>

          <div className="p-4 border border-slate-100 bg-slate-50 rounded-xl space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Elite Turf Season
                </p>
                <p className="text-[10px] text-slate-500">
                  Max Capacity: 120 Horses
                </p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 text-[9px] font-black uppercase rounded">
                Registration Open
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium">
              Currently accepting Owner submissions. 45/120 slots filled.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() =>
                  addToast(
                    "Tournament lifecycle shifted to Registration Closed.",
                    "info"
                  )
                }
                className="text-xs font-bold bg-white border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Close Registration
              </button>
              <button
                onClick={() =>
                  addToast("Entering parameter edit mode.", "info")
                }
                className="text-xs font-bold bg-white border border-slate-200 text-[#064E3B] px-3 py-1.5 rounded-lg hover:bg-slate-100"
              >
                Edit Params
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-Component 5: Virtual Economy (UC-AD-09) ─────────────────────────────

function VirtualEconomy({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto h-full">
      <div className="border-b border-[#064E3B]/10 pb-4">
        <h2 className="text-xl font-black font-headline text-[#064E3B]">
          Prediction Engine Console
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Oversee the platform's closed-loop virtual token simulation
          (UC-AD-09).
        </p>
      </div>

      {/* Security Alert Banner */}
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-rose-900 text-sm">
            Active Simulation Constraints Enforced
          </h4>
          <p className="text-xs text-rose-700 mt-1 leading-relaxed">
            BR-BET-01 strictly prohibits fiat extraction. The system
            automatically severs unauthorized external webhook or real-world
            cashout integrations.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Global Escrow Pool
          </span>
          <span className="text-2xl font-black font-label text-[#064E3B]">
            45,200
          </span>
          <p className="text-[9px] text-slate-500 mt-1">
            Tokens locked in active predictions
          </p>
        </div>
        <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            Circulating Volume
          </span>
          <span className="text-2xl font-black font-label text-indigo-600">
            1.2M
          </span>
          <p className="text-[9px] text-slate-500 mt-1">
            Total genesis and IAP tokens
          </p>
        </div>
        <div className="bg-white border rounded-2xl p-4 shadow-sm text-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
            House Multiplier
          </span>
          <span className="text-2xl font-black font-label text-emerald-600">
            1.0x
          </span>
          <p className="text-[9px] text-slate-500 mt-1">
            Current base reward scale
          </p>
        </div>
      </div>

      <div className="bg-white border rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-[#064E3B] border-b pb-2 flex items-center gap-2">
          <Settings className="w-4 h-4" /> Configure Engine Parameters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                Max Stake Ceiling (Per User)
              </label>
              <input
                type="number"
                defaultValue="5000"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-label outline-none focus:border-[#064E3B]"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
                Default Reward Multiplier
              </label>
              <input
                type="number"
                step="0.1"
                defaultValue="1.0"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs font-label outline-none focus:border-[#064E3B]"
              />
            </div>
            <button
              onClick={() =>
                addToast(
                  "Virtual economy parameters successfully updated.",
                  "success"
                )
              }
              className="bg-[#064E3B] text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm hover:bg-[#043E2F]"
            >
              Apply Configurations
            </button>
          </div>

          <div className="border-l pl-6 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">
              Recent Security Audits
            </h4>
            <div className="space-y-2">
              <div className="p-2 border border-emerald-100 bg-emerald-50 rounded text-[10px] text-emerald-800 font-label">
                [12:00] Token Genesis Drop (1000) applied cleanly to verified
                Spectator 'user_881'.
              </div>
              <div className="p-2 border border-rose-100 bg-rose-50 rounded text-[10px] text-rose-800 font-label">
                [11:42] WARN: Invalid negative multiplier entry attempt
                rejected. State reverted.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
