import { useState } from "react";
import type { User } from "../../types/user.ts";
import { FieldBox } from "../FieldBox.tsx";
import useAuth from "../../hooks/useAuth.ts";
import EditProfileModal from "./EditProfileModal.tsx";
import ChangePasswordModal from "./ChangePasswordModal.tsx";

type Props = {
  user: User;
  refreshUser: () => void;
};

export default function AccountPanel({ user, refreshUser }: Props) {
  const { logout } = useAuth();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  return (
    <div className="flex gap-5 flex-wrap p-5">
      {/* Profile card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-3 w-56 shrink-0">
        <div className="w-16 h-16 rounded-full bg-[#064E3B]/10 flex items-center justify-center text-2xl font-bold text-[#064E3B]">
          {(user.fullName ?? "").charAt(0).toUpperCase()}
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-slate-900">{user.fullName}</p>
          <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-[#D1FAE5] text-[#064E3B] text-xs font-bold border border-[#064E3B]/20">
          {user.role}
        </span>
        <button
          onClick={logout}
          className="px-3 py-1 rounded-full bg-red-200 hover:bg-red-400 active:bg-red-500 text-[#064E3B] text-xs font-bold border border-[#064E3B]/20"
        >
          Logout
        </button>
      </div>

      {/* Read-only fields */}
      <div className="flex-1 min-w-64 flex flex-col gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-800 text-sm">
              Contact Information
            </span>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Edit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldBox
              label="Full Name"
              value={user.fullName ?? ""}
              editing={false}
            />
            <FieldBox label="Email" value={user.email} editing={false} />
            <FieldBox label="Phone Number" value={user.phone ?? ""} editing={false} />
            <FieldBox label="Address" value={user.address ?? ""} editing={false} />
          </div>
        </div>

        <button
          onClick={() => setIsPasswordModalOpen(true)}
          className="self-start text-xs font-bold text-[#064E3B] underline underline-offset-4 hover:text-[#043E2F] transition-colors"
        >
          Change password?
        </button>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onSaved={refreshUser}
      />
      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        onSaved={refreshUser}
      />
    </div>
  );
}
