import { useState } from "react";
import { Search, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "../../lib/utils";
import type { ToastType } from "../../pages/AdminPage";
import useAdmin from "../../hooks/useAdmin.ts";

type OpenMenuState =
  | { id: string; type: "role" }
  | { id: string; type: "status" }
  | null;

const ROLE_OPTIONS = [
  {
    role: "admin",
    label: "Admin",
  },
  {
    role: "jockey",
    label: "Jockey",
  },
  {
    role: "horse_owner",
    label: "Horse Owner",
  },
  {
    role: "spectator",
    label: "Spectator",
  },
] as const;

export default function AccessManagement({
  addToast,
}: {
  addToast: (m: string, t?: ToastType) => void;
}) {
  const {
    users,
    loading,
    error,
    pagination,
    setPagination,
    updateUserRole,
    updateUserStatus,
    actionLoading,
  } = useAdmin();

  const [openMenu, setOpenMenu] = useState<OpenMenuState>(null);

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto h-full">
      <div className="flex items-center justify-between border-b border-[#064E3B]/10 pb-4">
        <div>
          <h2 className="text-xl font-black font-headline text-[#064E3B]">
            Access Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage user accounts, assign roles, and handle suspensions
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
              value={pagination.search ?? ""}
              className="w-full bg-slate-50 border rounded-xl pl-9 pr-4 py-2 text-xs focus:border-[#064E3B] outline-none"
            />
          </div>

          <select
            value={pagination.role ?? ""}
            className="bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="">All Roles</option>
            <option value="Spectator">Spectators</option>
            <option value="Owner">Owners</option>
            <option value="Jockey">Jockeys</option>
            <option value="Referee">Referees</option>
          </select>

          <select
            value={pagination.status ?? ""}
            className="bg-slate-50 border rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 outline-none"
          >
            <option value="">All Status</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
            {error}
          </div>
        )}

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
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading users...
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-slate-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="p-3">
                      <p className="font-bold text-slate-800">{u.fullName}</p>
                      <p className="text-[10px] text-slate-400">{u.email}</p>
                    </td>

                    <td className="p-3 font-semibold text-slate-600">
                      {u.role}
                    </td>

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

                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-2 relative">
                        <div className="relative">
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() =>
                              setOpenMenu(
                                openMenu?.id === u.id &&
                                  openMenu?.type === "role"
                                  ? null
                                  : { id: u.id, type: "role" }
                              )
                            }
                            className="inline-flex items-center gap-1 text-[10px] font-bold bg-[#064E3B]/10 text-[#064E3B] px-2.5 py-1.5 rounded hover:bg-[#064E3B]/20 transition disabled:opacity-50"
                          >
                            Edit Role
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {openMenu?.id === u.id &&
                            openMenu?.type === "role" && (
                              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-20 overflow-hidden">
                                {ROLE_OPTIONS.map((role) => (
                                  <button
                                    key={role.role}
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={async () => {
                                      await updateUserRole(u.id, role.role);
                                      addToast(
                                        `Role updated to ${role.label}.`,
                                        "info"
                                      );
                                      setOpenMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    {role.label}
                                  </button>
                                ))}

                                <button
                                  type="button"
                                  onClick={() => setOpenMenu(null)}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() =>
                              setOpenMenu(
                                openMenu?.id === u.id &&
                                  openMenu?.type === "status"
                                  ? null
                                  : { id: u.id, type: "status" }
                              )
                            }
                            className={cn(
                              "inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1.5 rounded border transition disabled:opacity-50",
                              u.status === "Active"
                                ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                                : "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            )}
                          >
                            Edit Status
                            <ChevronDown className="w-3 h-3" />
                          </button>

                          {openMenu?.id === u.id &&
                            openMenu?.type === "status" && (
                              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-20 overflow-hidden">
                                {u.status === "active" ? (
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={async () => {
                                      await updateUserStatus(u.id, "locked");
                                      addToast(
                                        "Account suspended. Active tokens destroyed.",
                                        "warning"
                                      );
                                      setOpenMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    Lock Account
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={async () => {
                                      await updateUserStatus(u.id, "active");
                                      addToast(
                                        "Account restored to Active.",
                                        "success"
                                      );
                                      setOpenMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    Active Account
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => setOpenMenu(null)}
                                  className="w-full text-left px-3 py-2 text-xs hover:bg-slate-50 text-slate-500"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="flex items-center gap-2 pt-3">
            <button
              disabled={pagination.page <= 1}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page - 1,
                }))
              }
              className="border rounded-lg px-3 py-1 disabled:opacity-50"
            >
              Prev
            </button>

            <span className="text-sm text-slate-600">
              {pagination.page} / {pagination.totalPages}
            </span>

            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() =>
                setPagination((prev) => ({
                  ...prev,
                  page: prev.page + 1,
                }))
              }
              className="border rounded-lg px-3 py-1 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
