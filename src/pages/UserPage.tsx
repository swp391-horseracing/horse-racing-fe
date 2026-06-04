import { useNavigate } from "react-router-dom";
import { useUserProfile } from "../hooks/useUserProfile.ts";
import AccountPanel from "../components/user_profile/accountPanel.tsx";
import ProfileSidebar from "../components/user_profile/ProfileSidebar.tsx";
// import PrivacyPanel from "../components/user_profile/PrivacyPanel.tsx";
import NotificationsPanel from "../components/user_profile/NotificationsPanel.tsx";
import useAuth from "../hooks/useAuth.ts";
import { ROUTES } from "../router/routes.tsx";

export default function UserPage() {
  const navigate = useNavigate();
  const {
    user,
    loading,
    activeTab,
    setActiveTab,
    editing,
    draft,
    setDraft,
    startEdit,
    saveEdit,
    cancelEdit,
  } = useUserProfile();

  const { logout } = useAuth();
  //
  // if (loading) return (
  //     <div className="flex items-center justify-center h-64 text-sm text-gray-400">
  //         Loading profile…
  //     </div>
  // )
  // if (!user) return null
  //

  const handleLogout = async () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="flex flex-col h-full w-full dark:bg-gray-900">
      {/* Sidebar + content */}
      <div className="flex gap-6 items-start h-full w-full">
        <div className="flex flex-col justify-center items-center h-full w-60 border-black text-gray-900">
          <ProfileSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="w-full h-20 py-4 flex flex-col justify-top pl-5 items-start">
            <div>
              <div className="flex flex-col justify-top items-start text-2xl font-bold text-gray-900">
                Account &amp; Settings
              </div>
              <p className="flex flex-col justify-top items-start text-sm text-gray-500 mt-1">
                Manage your profile and security preferences.
              </p>
            </div>
          </div>
          {activeTab === "account" && (
            <AccountPanel
              user={user}
              editing={editing}
              draft={draft}
              setDraft={setDraft}
              startEdit={startEdit}
              saveEdit={saveEdit}
              cancelEdit={cancelEdit}
            />
          )}
          {activeTab === "notifications" && <NotificationsPanel />}
          {/*{activeTab === "privacy"       && <PrivacyPanel user={user}/>}*/}
          {/*{activeTab === "settings"      && <SettingsPanel user={user} />}*/}
        </div>
      </div>
    </div>
  );
}
