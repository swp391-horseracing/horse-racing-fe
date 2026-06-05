import { useNavigate } from "react-router-dom";
import { SidebarProvider } from "../components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../components/ui/breadcrumb";
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

  const handleLogout = async () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full text-sm text-gray-400">
        User not found
      </div>
    );
  }

  const formatTabName = (tab: string) =>
    tab.charAt(0).toUpperCase() + tab.slice(1);

  return (
    <SidebarProvider className="!min-h-0 !h-full w-full overflow-hidden flex">
      <ProfileSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      {/* Main content viewport matching UserLayout */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F4F6F5] h-full overflow-hidden">
        {/* Top Header Bar using Custom Breadcrumb components */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-[#064E3B]/10 px-6 bg-white shadow-sm z-10">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink className="font-headline text-[#064E3B] text-sm hover:text-[#043E2F] transition-colors cursor-pointer">
                  Profile
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="font-body text-[#1E293B] font-bold">
                  {formatTabName(activeTab)}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        {/* Inner Content Area */}
        <div className="flex-1 relative min-h-0">
          <div className="absolute inset-0 flex flex-col overflow-y-auto p-8">
            <div className="flex-1">
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
              {/*{activeTab === "privacy" && <PrivacyPanel user={user}/>}*/}
              {/*{activeTab === "settings" && <SettingsPanel user={user} />}*/}
            </div>
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
