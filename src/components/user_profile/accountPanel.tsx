import type { User } from "../../types/user.ts";
import { FieldBox } from "../FieldBox.tsx";
import useAuth from "../../hooks/useAuth.ts";

type Props = {
  user: User;
  editing: boolean;
  draft: Partial<User>;
  setDraft: (fn: (p: Partial<User>) => Partial<User>) => void;
  startEdit: () => void;
  saveEdit: () => void;
  cancelEdit: () => void;
};

export default function AccountPanel({
  user,
  editing,
  draft,
  setDraft,
  startEdit,
  saveEdit,
  cancelEdit,
}: Props) {
  const { logout } = useAuth();
  return (
    <div className="flex gap-5 flex-wrap p-5">
      {/* Profile card */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center gap-3 w-56 shrink-0">
        <div className="w-16 h-16 rounded-full bg-[#064E3B]/10 flex items-center justify-center text-2xl font-bold text-[#064E3B]">
          {user.full_name?.charAt(0).toUpperCase()}
        </div>
        <div className="text-center">
          <p className="font-bold text-sm text-gray-900">{user.full_name}</p>
          <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
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

      {/* Editable fields */}
      <div className="flex-1 min-w-64 flex flex-col gap-4">
        {/* Contact info */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-gray-800 text-sm">
              📋 Contact Information
            </span>
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={saveEdit}
                    className="px-4 py-1.5 rounded-lg bg-[#064E3B] text-white text-xs font-bold hover:bg-[#053d2f] transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={startEdit}
                  className="px-4 py-1.5 rounded-lg border border-gray-300 text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <FieldBox
              label="Full Name"
              value={user.full_name}
              editing={editing}
              name="full_name"
              draft={draft}
              setDraft={setDraft}
            />
            <FieldBox
              label="Email"
              value={user.email}
              editing={editing}
              name="email"
              draft={draft}
              setDraft={setDraft}
            />
            <FieldBox
              label="Phone Number"
              value={user.phone}
              editing={editing}
              name="phone"
              draft={draft}
              setDraft={setDraft}
            />
            <FieldBox
              label="Address"
              value={user.address}
              editing={editing}
              name="address"
              draft={draft}
              setDraft={setDraft}
            />
            <FieldBox
              label="Password"
              value={user.password}
              editing={editing}
              name="password"
              draft={draft}
              setDraft={setDraft}
            />
          </div>
        </div>

        {/* Security */}
      </div>
    </div>
  );
}
