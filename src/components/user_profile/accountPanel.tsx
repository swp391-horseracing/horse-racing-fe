import type { User } from "../../types/user.ts";
import { FieldBox } from "../FieldBox.tsx";

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
  return (
    <div className="flex gap-5 flex-wrap">
      {/* Profile card */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col items-center gap-3 w-56 shrink-0">
        ${user.full_name}
        <div className="text-center">
          {/*<p className="font-bold text-lg text-gray-900 dark:text-gray-100 font-['Playfair_Display',serif]">{user.name}</p>*/}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {user.email}
          </p>
        </div>
        <div className="flex flex-wrap gap-1 justify-center items-center w-full">
          {user.roles.map((role) => (
            <div key={role}>
              <span className="flex items-center gap-1.5 px-1.5 py-1.5 rounded-full bg-[#D1FAE5] text-[#064E3B] text-xs font-bold border border-[#064E3B]/20">
                {role}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Contact info */}
      <div className="flex-1 min-w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-100 text-sm">
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
                  className="px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                onClick={startEdit}
                className="px-4 py-1.5 rounded-lg border border-gray-300 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                EDIT ALL
              </button>
            )}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FieldBox
            label="Phone Number"
            value={user.phone}
            editing={editing}
            name="phone"
            draft={draft}
            setDraft={setDraft}
          />
          <FieldBox
            label="Stable Address"
            value={user.address}
            editing={editing}
            name="address"
            draft={draft}
            setDraft={setDraft}
          />
          <FieldBox
            label="Stable Address"
            value={user.email}
            editing={editing}
            name="address"
            draft={draft}
            setDraft={setDraft}
          />
        </div>
      </div>
    </div>
  );
}
