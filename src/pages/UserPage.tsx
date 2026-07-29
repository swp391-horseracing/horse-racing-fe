import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { useUserProfile, type ProfileTab } from "../hooks/useUserProfile";
import UserLayout from "../layouts/UserLayout";
import ProfileOverview from "../components/user_profile/ProfileOverview";
import ProfileExchanges from "../components/user_profile/ProfileExchanges";
import ProfileActivityHistory from "../components/user_profile/ProfileActivityHistory";
import { WalletService } from "../services/WalletService";
import { PredictionService } from "../services/PredictionService";
import { NotificationService } from "../services/NotificationService";
import { UserService } from "../services/UserService";
import { TrackService } from "../services/TrackService";
import { useAuthContext } from "../contexts/AuthContext";
import type { WalletTransaction } from "../types/wallet";
import type { Prediction } from "../types/prediction";
import type { UserRace, MyEntry } from "../types/user";
import {
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit2,
  LogOut,
  Save,
  X,
} from "lucide-react";

export default function UserPage() {
  const { user, loading: userLoading, refreshUser } = useUserProfile();
  const { logout } = useAuthContext();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as ProfileTab) || "overview";

  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [races, setRaces] = useState<UserRace[]>([]);
  const [entries, setEntries] = useState<MyEntry[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Inline editing states
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState<boolean>(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Ensure default query parameter is set
  useEffect(() => {
    if (!searchParams.get("tab")) {
      setSearchParams(
        (prev) => {
          prev.set("tab", "overview");
          return prev;
        },
        { replace: true }
      );
    }
  }, [searchParams, setSearchParams]);

  const loadExtraData = useCallback(async () => {
    if (!user) return;
    try {
      setDataLoading(true);
      const role = user.role.toLowerCase();

      // Fetch wallet if spectator
      if (role === "spectator") {
        try {
          const w = await WalletService.getMyWallet();
          setWalletBalance(w.balance);
          setTransactions(w.transactions || []);
        } catch (e) {
          console.error("Failed to load wallet", e);
        }
        try {
          const p = await PredictionService.getMyPredictions({ limit: 100 });
          setPredictions(p.data || []);
        } catch (e) {
          console.error("Failed to load predictions", e);
        }
      }

      // Fetch races for Referee / Jockey
      if (role === "referee" || role === "jockey") {
        try {
          const r = await UserService.getMyRaces(1, 100);
          setRaces(r.data || []);
        } catch (e) {
          console.error("Failed to load races", e);
        }
      }

      // Fetch entries for Owner
      if (role === "owner" || role === "horse_owner") {
        try {
          const ent = await UserService.getMyEntries(undefined, 1, 100);
          setEntries(ent.data || []);
        } catch (e) {
          console.error("Failed to load entries", e);
        }
      }

      // Fetch tracks if admin
      if (role === "admin") {
        try {
          const t = await TrackService.getTracks({ limit: 100 });
          setTracks(t.data || []);
        } catch (e) {
          console.error("Failed to load tracks", e);
        }
      }

      // Load notifications for all roles
      try {
        const n = await NotificationService.getNotifications();
        setNotifications(n || []);
      } catch (e) {
        console.error("Failed to load notifications", e);
      }
    } catch (err) {
      console.error("Error loading profile extra details", err);
    } finally {
      setDataLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadExtraData();
    }
  }, [user, loadExtraData]);

  // Start editing mode and populate form fields
  const handleStartEdit = () => {
    if (!user) return;
    setEditForm({
      fullName: user.full_name || "",
      email: user.email || "",
      phone: user.phone || "",
      address: user.address || "",
    });
    setEditError(null);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditError(null);
  };

  const handleSaveChanges = async () => {
    if (!user) return;
    setSaving(true);
    setEditError(null);
    try {
      const res = await UserService.updateUser(user.id, {
        full_name: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        address: editForm.address,
      });
      if (res && res.token) {
        localStorage.setItem("token", res.token);
      }
      await refreshUser();
      setIsEditing(false);
    } catch (err: any) {
      setEditError(
        err?.response?.data?.message || "Failed to update profile changes."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setSaving(true);
      await UserService.uploadAvatar(file);
      await refreshUser();
    } catch (err) {
      console.error("Failed to upload avatar", err);
      setEditError("Failed to upload profile picture.");
    } finally {
      setSaving(false);
      e.target.value = "";
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error("Failed to logout", e);
    }
  };

  if (userLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-6 font-body text-slate-500">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">
            Loading premium profile...
          </span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-8 text-center text-red-500 font-body font-bold text-sm">
        User profile not found or session expired. Please log in again.
      </div>
    );
  }

  const roleText =
    user.role.toLowerCase() === "horse_owner"
      ? "Horse Owner"
      : user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase();

  return (
    <UserLayout
      activeKey={activeTab}
      onActiveKeyChange={(key) =>
        setSearchParams((prev) => {
          prev.set("tab", key);
          return prev;
        })
      }
    >
      <div className="flex-1 min-w-0 h-full overflow-y-auto p-3 space-y-3 max-h-screen">
        {/* PREMIUM USER HEADER CARD WITH SEAMLESS INLINE EDITING */}
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 hover:shadow-md transition-shadow duration-300">
          <div className="flex flex-col md:flex-row items-center gap-5 w-full md:w-auto">
            {/* Avatar container */}
            <button
              type="button"
              disabled={!isEditing}
              aria-label="Change profile picture"
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer shrink-0 disabled:cursor-default"
            >
              <div className="w-20 h-20 rounded-full bg-[#F4F6F5] border-2 border-emerald-600 flex items-center justify-center text-emerald-800 text-2xl font-headline font-black overflow-hidden shadow-inner">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.full_name.charAt(0)
                )}
              </div>
              <div
                className={`absolute inset-0 bg-[#064E3B]/40 rounded-full flex items-center justify-center transition-opacity duration-200 ${
                  isEditing
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-100"
                }`}
              >
                <Camera className="w-5 h-5 text-white" />
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                accept="image/*"
                aria-label="Profile picture file"
                className="hidden"
              />
            </button>

            <div className="text-center md:text-left space-y-2 flex-1 w-full">
              <div className="flex flex-col md:flex-row items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editForm.fullName}
                    onChange={(e) =>
                      setEditForm({ ...editForm, fullName: e.target.value })
                    }
                    className="bg-transparent border-t-0 border-x-0 border-b border-slate-300 focus:border-emerald-600 focus:ring-0 focus:outline-none rounded-none py-0 w-full md:w-64"
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: "#064E3B",
                      lineHeight: "2rem",
                      margin: 0,
                      padding: 0,
                    }}
                    placeholder="Full Name"
                    aria-label="Full Name"
                    required
                  />
                ) : (
                  <h1
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 900,
                      fontFamily: "'Playfair Display', Georgia, serif",
                      color: "#064E3B",
                      lineHeight: "2rem",
                      margin: 0,
                      padding: 0,
                    }}
                  >
                    {user.full_name}
                  </h1>
                )}

                <span
                  className={`shrink-0 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    user.role.toLowerCase() === "spectator"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : user.role.toLowerCase() === "referee"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : user.role.toLowerCase() === "jockey"
                          ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {roleText}
                </span>
              </div>

              {editError && (
                <p className="text-[11px] text-red-500 font-bold font-body">
                  {editError}
                </p>
              )}

              <div className="flex flex-col md:flex-row md:flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-700 font-body">
                {/* Email field */}
                <div className="flex items-center gap-1.5 w-full md:w-auto">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {isEditing ? (
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      className="bg-transparent border-t-0 border-x-0 border-b border-slate-300 focus:border-emerald-600 focus:ring-0 focus:outline-none rounded-none py-0 w-full md:w-48"
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        fontFamily:
                          "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
                        color: "#334155",
                        lineHeight: "1.25rem",
                        margin: 0,
                        padding: 0,
                      }}
                      placeholder="Email Address"
                      aria-label="Email Address"
                      required
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        fontFamily:
                          "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
                        color: "#334155",
                        lineHeight: "1.25rem",
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {user.email}
                    </span>
                  )}
                </div>

                {/* Phone field */}
                <div className="flex items-center gap-1.5 w-full md:w-auto">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      className="bg-transparent border-t-0 border-x-0 border-b border-slate-300 focus:border-emerald-600 focus:ring-0 focus:outline-none rounded-none py-0 w-full md:w-36"
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        fontFamily:
                          "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
                        color: "#334155",
                        lineHeight: "1.25rem",
                        margin: 0,
                        padding: 0,
                      }}
                      placeholder="Phone Number"
                      aria-label="Phone Number"
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        fontFamily:
                          "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
                        color: "#334155",
                        lineHeight: "1.25rem",
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {user.phone || "No phone added"}
                    </span>
                  )}
                </div>

                {/* Address field */}
                <div className="flex items-center gap-1.5 w-full md:w-auto">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.address}
                      onChange={(e) =>
                        setEditForm({ ...editForm, address: e.target.value })
                      }
                      className="bg-transparent border-t-0 border-x-0 border-b border-slate-300 focus:border-emerald-600 focus:ring-0 focus:outline-none rounded-none py-0 w-full md:w-48"
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        fontFamily:
                          "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
                        color: "#334155",
                        lineHeight: "1.25rem",
                        margin: 0,
                        padding: 0,
                      }}
                      placeholder="Address"
                      aria-label="Address"
                    />
                  ) : (
                    <span
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        fontFamily:
                          "'Hanken Grotesk', system-ui, -apple-system, sans-serif",
                        color: "#334155",
                        lineHeight: "1.25rem",
                        margin: 0,
                        padding: 0,
                      }}
                    >
                      {user.address || "No address added"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons (dynamic depending on editing state) */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end shrink-0">
            {isEditing ? (
              <>
                <button
                  onClick={handleSaveChanges}
                  disabled={saving}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 font-body shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 font-body shadow-sm"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleStartEdit}
                  className="px-4 py-2 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 font-body shadow-sm"
                >
                  <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                  Edit Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 font-body shadow-sm"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Log Out
                </button>
              </>
            )}
          </div>
        </div>

        {/* TAB ROUTING PANEL */}
        {dataLoading ? (
          <div className="text-center py-8 text-slate-400 text-xs font-body flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            Loading profile stats...
          </div>
        ) : (
          <div className="flex-1 min-h-0">
            {activeTab === "overview" && (
              <ProfileOverview
                user={user}
                walletBalance={walletBalance}
                transactions={transactions}
                predictions={predictions}
                races={races}
                entries={entries}
                tracks={tracks}
                onNavigateToTab={(tab) =>
                  setSearchParams((prev) => {
                    prev.set("tab", tab);
                    return prev;
                  })
                }
              />
            )}

            {activeTab === "exchanges" && <ProfileExchanges />}

            {activeTab === "activity" && (
              <ProfileActivityHistory
                transactions={transactions}
                predictions={predictions}
                notifications={notifications}
              />
            )}
          </div>
        )}
      </div>
    </UserLayout>
  );
}
