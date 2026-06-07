import { useUserProfile } from "../hooks/useUserProfile.ts";
import AccountPanel from "../components/user_profile/accountPanel.tsx";
import NotificationsPanel from "../components/user_profile/NotificationsPanel.tsx";
import UserLayout from "../layouts/UserLayout";

export default function UserPage() {
  const {
    user,
    loading,
    error,
    successMsg,
    activeTab,
    editing,
    draft,
    setDraft,
    startEdit,
    saveEdit,
    cancelEdit,
    clearError,
  } = useUserProfile();

  if (loading)
    return <div className="p-10 text-center">Loading profile...</div>;
  if (!user)
    return (
      <div className="p-10 text-center text-red-500">
        User not found or session expired.
      </div>
    );

  return (
    <UserLayout activeKey={activeTab}>
      <div className="flex-1 min-w-0 h-full overflow-y-auto p-6">
        <div className="w-full mb-6">
          <div className="text-2xl font-bold text-gray-900">
            Account &amp; Settings
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Manage your profile and security preferences.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative"
            role="alert"
          >
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error}</span>
            <span
              className="absolute top-0 bottom-0 right-0 px-4 py-3"
              onClick={clearError}
            >
              <svg
                className="fill-current h-6 w-6 text-red-500 cursor-pointer"
                role="button"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
              >
                <title>Close</title>
                <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
              </svg>
            </span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Success: </strong>
            <span className="block sm:inline">{successMsg}</span>
          </div>
        )}

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
      </div>
    </UserLayout>
  );
}
