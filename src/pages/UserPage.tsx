import { useUserProfile, type ProfileTab } from "../hooks/useUserProfile.ts";
import AccountPanel from "../components/user_profile/accountPanel.tsx";
import NotificationsPanel from "../components/user_profile/NotificationsPanel.tsx";
import UserLayout from "../layouts/UserLayout";

export default function UserPage() {
  const { user, loading, activeTab, setActiveTab, refreshUser } = useUserProfile();

  if (loading)
    return <div className="p-10 text-center">Loading profile...</div>;
  if (!user)
    return (
      <div className="p-10 text-center text-red-500">
        User not found or session expired.
      </div>
    );

  return (
    <UserLayout activeKey={activeTab} onActiveKeyChange={(key) => setActiveTab(key as ProfileTab)}>
      <div className="flex-1 min-w-0 h-full overflow-y-auto p-6">
        <div className="w-full mb-6">
          <div className="text-2xl font-bold text-[#064E3B]">
            Account &amp; Settings
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage your profile and security preferences.
          </p>
        </div>

        {/* Error Alert */}

        {/* Success Alert */}

        {activeTab === "account" && (
          <AccountPanel user={user} refreshUser={refreshUser} />
        )}

        {activeTab === "notifications" && <NotificationsPanel />}
      </div>
    </UserLayout>
  );
}
