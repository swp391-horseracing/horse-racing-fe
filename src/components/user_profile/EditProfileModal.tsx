import { useState } from "react";
import { UserService } from "../../services/UserService";
import type { User } from "../../types/user";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSaved: () => void;
};

export default function EditProfileModal({
  isOpen,
  onClose,
  user,
  onSaved,
}: Props) {
  const [fullName, setFullName] = useState(user.full_name ?? "");
  const [email, setEmail] = useState(user.email ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [address, setAddress] = useState(user.address ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = async () => {
    setError(null);

    setSaving(true);
    try {
      const userId = sessionStorage.getItem("userId");
      if (!userId) throw new Error("Missing userId");

      const payload: Record<string, string> = {
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };

      await UserService.updateUser(userId, payload);
      onSaved();
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error?.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-slate-100 max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-8">
        <div className="bg-gradient-to-r from-[#064E3B] to-[#0b634c] p-6 text-white relative">
          <h3 className="font-bold text-lg font-headline !text-white">
            Edit Profile
          </h3>
          <p className="text-xs text-emerald-100/80 mt-1">
            Update your personal information
          </p>
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Full Name
              </label>
              <input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                type="text"
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#064E3B] rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#064E3B] rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Phone Number
              </label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                type="text"
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#064E3B] rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition"
              />
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Address
              </label>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                type="text"
                className="w-full bg-slate-50 hover:bg-slate-100/50 focus:bg-white border border-slate-200 focus:border-[#064E3B] rounded-xl px-3 py-2.5 text-xs font-medium outline-none transition"
              />
            </div>
          </div>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-end px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-[#064E3B] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#043E2F] active:scale-95 transition duration-200 shadow-md shadow-[#064E3B]/10 disabled:opacity-50 flex items-center gap-2"
          >
            {saving && (
              <svg className="animate-spin h-3.5 w-3.5 text-white" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
