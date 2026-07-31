import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X, Loader2 } from "lucide-react";
import { formatStatus } from "../../../utils/formatters";
import type { User } from "../../../types/user";
import { StatusBadge, USER_STATUS_STYLES } from "../../ui/StatusBadge";

interface UserDetailsModalProps {
  isOpen: boolean;
  user: User | null;
  loading: boolean;
  error?: string | null;
  onClose: () => void;
}

export default function UserDetailsModal({
  isOpen,
  user,
  loading,
  error,
  onClose,
}: UserDetailsModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle Escape key
  useEffect(() => {
    if (!isOpen) return;

    console.log("Modal opened for user:", user?.id);

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        console.log("Escape pressed, closing modal");
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, user, onClose]);

  useEffect(() => {
    console.log("Modal state changed - user:", user?.id, "loading:", loading);
  }, [user, loading]);

  if (!isOpen) {
    console.log("Modal hidden - not open");
    return null;
  }

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      role="presentation"
      style={{ pointerEvents: "auto" }}
    >
      <div
        ref={modalRef}
        className="bg-white border rounded-2xl shadow-xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        style={{ pointerEvents: "auto" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b">
          <h2 className="text-xl font-bold text-[#064E3B]">User Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#064E3B]" />
          </div>
        ) : error ? (
          <div className="text-center py-8 text-rose-600 font-semibold">
            {error}
          </div>
        ) : user ? (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="space-y-4">
              <h3 className="font-semibold text-slate-700">
                Profile Information
              </h3>

              {/* Avatar */}
              {user.avatar_url && (
                <div className="flex justify-center mb-4">
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#064E3B]/20"
                  />
                </div>
              )}

              {/* Info Rows */}
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Full Name</span>
                  <span className="font-semibold text-slate-800">
                    {user.full_name}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Email</span>
                  <span className="font-semibold text-slate-800 text-sm">
                    {user.email}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Phone</span>
                  <span className="font-semibold text-slate-800">
                    {user.phone || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Address</span>
                  <span className="font-semibold text-slate-800 text-right text-sm">
                    {user.address || "N/A"}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Section */}
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-slate-700">
                Account Information
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Role</span>
                  <span className="font-semibold text-slate-800 capitalize">
                    {user.role}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-600">Status</span>
                  <StatusBadge
                    status={user.status.toLowerCase()}
                    styleMap={USER_STATUS_STYLES}
                    label={formatStatus(user.status)}
                    size="md"
                    className="uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-6 px-4 py-2 bg-[#064E3B]/10 hover:bg-[#064E3B]/20 text-[#064E3B] font-semibold rounded-lg transition"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="space-y-6 text-center py-8">
            <p className="text-slate-500 font-semibold">
              No user details found.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-6 px-4 py-2 bg-[#064E3B]/10 hover:bg-[#064E3B]/20 text-[#064E3B] font-semibold rounded-lg transition"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
