import { useState, useRef } from "react";
import { UserService } from "../../services/UserService";
import type { User } from "../../types/user";
import { Upload } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onSaved: () => void;
};

export default function ViewAvatarModal({
  isOpen,
  onClose,
  user,
  onSaved,
}: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    try {
      await UserService.uploadAvatar(file);
      onSaved();
      onClose();
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { status?: number; data?: { message?: string } };
      };
      if (axiosErr?.response?.status === 401) {
        setError(axiosErr?.response?.data?.message || "Session expired. Please log in again.");
        localStorage.removeItem("token");
        sessionStorage.clear();
        window.location.href = "/login";
        return;
      }
      setError(axiosErr?.response?.data?.message || "Failed to upload avatar");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 max-w-sm w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-[#064E3B] to-[#0b634c] p-6 text-white relative">
          <h3 className="font-bold text-lg font-headline !text-white">
            Profile Picture
          </h3>
          <p className="text-xs text-emerald-100/80 mt-1">
            View and update your avatar
          </p>
        </div>

        <div className="p-6 space-y-5">
          <div className="flex justify-center">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.full_name}
                className="w-52 h-52 rounded-full object-cover border-4 border-slate-100 shadow-lg"
              />
            ) : (
              <div className="w-52 h-52 rounded-full bg-[#064E3B]/10 flex items-center justify-center text-6xl font-bold text-[#064E3B] border-4 border-slate-100 shadow-lg">
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="text-center">
            <p className="font-bold text-base text-slate-900">
              {user.full_name}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
          </div>

          <button
            type="button"
            onClick={triggerFileInput}
            disabled={uploading}
            className="w-full rounded-xl bg-[#064E3B] text-white px-5 py-2.5 text-xs font-bold hover:bg-[#043E2F] active:scale-95 transition duration-200 shadow-md shadow-[#064E3B]/10 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {uploading ? (
              <svg
                className="animate-spin h-3.5 w-3.5 text-white"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
            ) : (
              <Upload className="w-3.5 h-3.5" />
            )}
            {uploading ? "Uploading..." : "Change Profile Picture"}
          </button>

          <p className="text-[10px] text-slate-400 text-center">
            PNG, JPG up to 5MB
          </p>

          {error && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2 text-center">
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-center px-6 pb-6">
          <button
            type="button"
            onClick={onClose}
            disabled={uploading}
            className="rounded-xl border border-slate-200 px-6 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50 active:scale-95 transition duration-200 disabled:opacity-50"
          >
            Close
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
}
