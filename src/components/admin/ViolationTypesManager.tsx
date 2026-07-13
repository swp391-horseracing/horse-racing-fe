import { useState, useEffect, useCallback } from "react";
import {
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AdminService } from "../../services/AdminService";
import type { ToastType } from "../../types/referee";
import type { ViolationTypeConfig } from "../../types/violationType";

interface ViolationTypesManagerProps {
  addToast: (message: string, type?: ToastType) => void;
}

interface FormState {
  violationType: string;
  pointsDeducted: string;
  description: string;
}

const emptyForm: FormState = {
  violationType: "",
  pointsDeducted: "",
  description: "",
};

export default function ViolationTypesManager({
  addToast,
}: ViolationTypesManagerProps) {
  const [configs, setConfigs] = useState<ViolationTypeConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<ViolationTypeConfig | null>(
    null
  );
  const [deleting, setDeleting] = useState(false);

  const limit = 10;

  const fetchConfigs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await AdminService.getViolationTypes({ page, limit });
      setConfigs(res.data);
      setTotalPages(res.pagination.totalPages);
      setTotal(res.pagination.total);
    } catch (e: any) {
      addToast(
        e.response?.data?.message || "Failed to load violation types",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }, [page, addToast]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const res = await AdminService.getViolationTypes({ page, limit });
        if (cancelled) return;
        setConfigs(res.data);
        setTotalPages(res.pagination.totalPages);
        setTotal(res.pagination.total);
      } catch (e: any) {
        if (cancelled) return;
        addToast(
          e.response?.data?.message || "Failed to load violation types",
          "error"
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [page, addToast]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (c: ViolationTypeConfig) => {
    setEditingId(c.id);
    setForm({
      violationType: c.violationType,
      pointsDeducted: String(c.pointsDeducted),
      description: c.description || "",
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    const points = parseInt(form.pointsDeducted, 10);
    if (!form.violationType.trim() || !Number.isFinite(points) || points < 1)
      return;
    setSaving(true);
    try {
      const payload = {
        violationType: form.violationType.trim(),
        pointsDeducted: points,
        description: form.description.trim() || null,
      };
      if (editingId) {
        await AdminService.updateViolationType(editingId, payload);
        addToast("Violation type updated", "success");
      } else {
        await AdminService.createViolationType(payload);
        addToast("Violation type created", "success");
      }
      setShowModal(false);
      setPage(1);
    } catch (e: any) {
      addToast(
        e.response?.data?.message || "Failed to save violation type",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await AdminService.deleteViolationType(deleteTarget.id);
      addToast("Violation type deleted", "success");
      setDeleteTarget(null);
      fetchConfigs();
    } catch (e: any) {
      const msg =
        e.response?.status === 409
          ? "Cannot delete: this violation type is in use by existing violations."
          : e.response?.data?.message || "Failed to delete violation type";
      addToast(msg, "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="border-b border-[#064E3B]/10 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black font-headline text-[#064E3B]">
            Violation Types
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Define violation types with fixed point deductions for referees to
            apply during races.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="text-xs font-bold px-4 py-2 rounded-xl bg-[#064E3B] text-white hover:bg-[#043E2F] transition flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> Create Violation Type
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#064E3B]/10 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <Loader2 className="w-6 h-6 text-[#064E3B] animate-spin" />
          </div>
        ) : configs.length === 0 ? (
          <div className="text-center py-16 text-slate-400">
            <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold">No violation types defined</p>
            <p className="text-xs mt-1">
              Create your first violation type to get started.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">
                    Violation Type
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">
                    Points Deducted
                  </th>
                  <th className="text-left py-3 px-4 text-[10px] font-black text-slate-400 uppercase">
                    Description
                  </th>
                  <th className="text-right py-3 px-4 text-[10px] font-black text-slate-400 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {configs.map((c) => (
                  <tr
                    key={c.id}
                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {c.violationType}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-label font-bold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-md">
                        -{c.pointsDeducted} pts
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                      {c.description || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(c)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition cursor-pointer"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(c)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 bg-slate-50/30">
            <p className="text-[10px] text-slate-500 font-semibold">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {(page - 1) * limit + 1}
              </span>
              –
              <span className="font-bold text-slate-700">
                {Math.min(page * limit, total)}
              </span>{" "}
              of <span className="font-bold text-slate-700">{total}</span> types
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => setPage(pageNum)}
                    className={`w-7 h-7 rounded-lg text-[10px] font-bold transition cursor-pointer ${
                      page === pageNum
                        ? "bg-[#064E3B] text-white shadow-sm"
                        : "text-slate-500 hover:bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => !saving && setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-md space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold font-headline text-[#064E3B] text-lg">
              {editingId ? "Edit Violation Type" : "Create Violation Type"}
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Type Name
                </label>
                <input
                  type="text"
                  value={form.violationType}
                  onChange={(e) =>
                    setForm({ ...form, violationType: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                  placeholder="e.g. false_start"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Points Deducted
                </label>
                <input
                  type="number"
                  min={1}
                  value={form.pointsDeducted}
                  onChange={(e) =>
                    setForm({ ...form, pointsDeducted: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                  placeholder="e.g. 3"
                />
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase block mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold h-20 resize-none focus:outline-none focus:ring-2 focus:ring-[#064E3B]/20"
                  placeholder="Describe when this violation applies..."
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setShowModal(false)}
                disabled={saving}
                className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={
                  saving ||
                  !form.violationType.trim() ||
                  !form.pointsDeducted ||
                  parseInt(form.pointsDeducted, 10) < 1
                }
                className="text-xs font-bold px-4 py-2 rounded-lg bg-[#064E3B] text-white hover:bg-[#043E2F] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : editingId ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-2xl p-6 shadow-2xl w-full max-w-sm space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold font-headline text-red-700 text-lg flex items-center gap-2">
              <Trash2 className="w-5 h-5" /> Delete Violation Type
            </h3>
            <p className="text-xs text-slate-600">
              Are you sure you want to delete{" "}
              <span className="font-bold text-slate-800">
                {deleteTarget.violationType}
              </span>
              ? This action cannot be undone. If it is already in use by
              existing violations, the deletion will be blocked.
            </p>
            <div className="flex gap-2 pt-2 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="text-xs font-bold px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-bold px-3 py-2 rounded-lg bg-red-700 text-white hover:bg-red-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
